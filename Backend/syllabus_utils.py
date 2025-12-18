import json
import os
#from langchain_google_genai import ChatGoogleGenerativeAI
from course_details import COURSES
from langchain_groq import ChatGroq

#api_key = os.environ.get('GOOGLE_API_KEY', "dummy-key-for-tests")

model = ChatGroq(
    api_key=os.environ["GROQ_API_KEY"],
    model_name="llama-3.1-8b-instant",
    temperature=0.0
)


def clean_json(text: str):
    # Remove ```json or ``` or backticks
    return (
        text.replace("```json", "")
            .replace("```", "")
            .strip()
    )

def detect_syllabus_request(user_message:str):
    """
    AI-powered intent detection using Gemini.
    Identifies:
    - If the user is asking for a syllabus
    - Which course it belongs to
    """
    
    prompt = f"""
        You are an intent detector AI. 
        
        Golden Rule:
            Your main factor is time and accuracy detection.
            you have very limited time to detect within 2 to 3 seconds.
            You have to be very accurate in detecting the syllabus request.
        
        Task:
            Is to analyze user messages and determine if they are requesting a course syllabus from the smatal academy.
            Example question can be:
            1. "Can you provide the syllabus for the Python course?"
            2. "I would like to see the course outline for Data Science."
            3. "What topics are covered in the Java syllabus?"
            4. "Show me the course content for Graphic Design."
            And many more similar queries to detect the syllabus name.
            5.You should only respond with JSON data as per the format below.
            6.No extra text outside the JSON.
            7.No explanations even about the json format or anything.
            8.Ensure the JSON is properly formatted.
            Important Note:
                You have to detect as soon as possible within the 2 to 3 seconds with correct JSON format and also detect the course name correctly.

            If the user is requesting a syllabus, identify the specific course from the following list:
            {list(COURSES.keys())}
        
            Even if the user:
            - spells wrong ("pyton sylabus")
            - uses slang ("bro give me python outline")
            - mixes text ("what do u teach in data sci")
            - speaks in short forms ("ds syllabus")
            - uses emojis.
            
            Dectect the course name accurately based on the user message with context only if the user ask for the course syllabus detail.
            
            Detection time is crucial. Respond quickly.
            
            You MUST output STRICT JSON ONLY..
            The JSON should be in the following format:

                {{
                "is_syllabus_request": true/false,
                "course": "course_name_or_empty"
                }}
                
        Examples of expected output:
            1. If user is asking for syllabus:
            {{
                "is_syllabus_request": true,
                "course": "user_requested_course_name"
            }}
            2.what is the java syallabus?
            {{
                "is_syllabus_request": true,
                "course": "java"
            }}
            3. If user is NOT asking for syllabus:
            {{
                "is_syllabus_request": false,
                "course": ""
            }}
                
        User Message: "{user_message}"
        Respond in JSON only.
        """
    
    try:
        response = model.invoke(prompt)
        print("Detector model response:", response)
        json_data = response.content
        print("Before Raw JSON data:", json_data)
        json_data = clean_json(json_data)
        print("Raw JSON data:", json_data)
        data = json.loads(json_data)
        print("Detector model response:", data)
        
        if data.get("is_syllabus_request"):
            course = data.get("course","").lower().strip()
            if course in COURSES:
                return course
        print("No syllabus request detected.")    
        return None
    except Exception as e:
        print("Error in syllabus request detection:", str(e))
        return None    
    
def syllabus_response(course, user_id, submitted_users):
    if not course or course not in COURSES:
        return {
            "response": "Sorry, I couldn't find that course syllabus. Please check the course name.",
            "need_details": False
        }

    if user_id not in submitted_users:
        return {
            "response": f"I can share the {course} syllabus PDF with you. Please fill your details 😊",
            "need_details": True,
            "course": course
        }

    pdf_file = COURSES[course]
    return {
        "response": f"Here is the {course} syllabus 📘:<br><a href='/static/pdfs/{pdf_file}' target='_blank'>Download PDF</a>",
        "need_details": False
    } 
        