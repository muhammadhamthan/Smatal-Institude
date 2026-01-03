# import sys, io
# sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
# sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

import os
from pathlib import Path
from flask import Flask, request, jsonify,make_response,request
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
#from syllabus_utils import detect_syllabus_request, syllabus_response
from course_details import COURSES
from google_sheet import append_row_to_sheet
from redis_cache import get_user_memory_from_redis, save_user_memory_to_redis,redis_key_for_user,redis_client
from Syllabus_fuzz_detection import detect_syllabus_request as detect_syllabus_request,syllabus_response
from intent_detection import handle_short_intent

app = Flask(
    __name__
)

user_submissions = set()
#-------------- Flask routes --------------     

@app.route("/")
def health():
    return {"status": "API running"}

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print("recideved data",data)
    user_message = data.get('message')
    user_id = data.get('user_id')
    print("User ID:", user_id)
    
    print("1")
    from langchain_helper import get_qa_chain
    from llm_router import run_with_fallback as run_chain_with_fallback
    from singleton_retriver import get_retriever_once
    print("2")
    
    #Retrieve user memory from Redis
    memory = get_user_memory_from_redis(user_id)
    print("3")
    
    retriever = get_retriever_once()
    print("4")
    
    try:
        print("User message received:", user_message)
        
        short_intent_response = handle_short_intent(
                user_message,
                memory,
                user_submissions,
                user_id
        )

        if short_intent_response:
            return jsonify(short_intent_response)
        
        print("4.2")
        course = detect_syllabus_request(user_message)
        print("5")
        if course:
            return jsonify(syllabus_response(course,user_id,user_submissions))

        #Build input with user message only — memory is auto-used by chain
        # input_data = {
        #     "question": user_message
        # }

        response = run_chain_with_fallback(
                                        get_qa_chain,
                                        retriever,
                                        memory,
                                        user_message,
                                        )
        print("Raw response from chain:", response)
        message = memory.chat_memory.messages
        print("Chat memory messages:", message)
        
        #Format answer with link conversion
        result = response['answer']
        #save memory after every message
        save_user_memory_to_redis(user_id,memory)
        #save_user_memory(user_id,memory)
        return jsonify({'response': result})
    except Exception as e:
        print("Error during model invocation:", str(e))
        return jsonify({'response': "Sorry,There is a backend issus please contact us 96499 64912 for more details."})
    
@app.route('/refresh', methods=['POST'])
def refresh_chat():
    try:
        user_id = request.get_json().get("user_id")
        deleted_key = redis_client.delete(redis_key_for_user(user_id))
        print(f"Deleted key: {deleted_key}")

        
        return jsonify({
            "status": "success",
            "message": "Chat memory cleared."
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
@app.route('/submit_details',methods=['POST'])
def submit_details():
    print("Inside submit details")
    data = request.get_json()
    user_id = data.get("user_id")
    name, email, phone, course = data["name"], data["email"], data["phone"], data["course"]
    data = [name, email, phone, course, user_id]
    print("Data to append:", data)
    result = append_row_to_sheet(data)
    print("Result of appending to sheet:", result)
    if result == "Success":
        user_submissions.add(user_id)
        pdf_file = COURSES[course]
        return jsonify({
            "status": "success",
            "response": f"Thank you {name}! 🎉<br>Here is the {course} syllabus:<br><a href='/static/pdfs/{pdf_file}' target='_blank'>Download PDF</a>"
        })
    else:
        return jsonify({
            "status": "error",
            "response": f"⚠️ Failed to save your details. Please try again later. ({result})"
        })
        
@app.route("/memory/context", methods=["POST"])
def add_context_to_memory():
    print("123")
    from langchain.schema import HumanMessage
    data = request.get_json()
    user_id = data.get("user_id")
    course = data.get("course")
    content = data.get("content")

    if not user_id or not course or not content:
        return jsonify({"status": "error", "message": "Invalid payload"}), 400
    
    print("111")
    # Load existing memory
    memory = get_user_memory_from_redis(user_id)

    # ✅ Inject context as a NON-question memory entry
    memory.chat_memory.messages.append(
        HumanMessage(
            content=f"User selected course: {course}. Course context: {content}"
        )
    )

    # Save back to Redis
    save_user_memory_to_redis(user_id, memory)

    return jsonify({"status": "success"})


        

if __name__ == '__main__':
    app.run(host = "0.0.0.0",port=8080, debug=True)



# #NEXT WORK IS  TO CHECK HOW TO DEBUG AND TEST THE CODE WITH MULTIPLE USERS
