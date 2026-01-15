# intent_detection.py

from course_details import COURSES

SHORT_INTENTS = {
    "fees": "fees",
    "fee": "fees",
    "career opportunities":"career opportunities",
    "career" : "career opportunities",
    "duration":"duration",
    "how long":"duration",
    "time period":"duration",
    "course length":"duration",
    "months":"duration",
}


def detect_short_intent(user_message: str):
    if not user_message:
        return None
    return SHORT_INTENTS.get(user_message.lower().strip())


def get_last_selected_course(memory):
    if not memory or not memory.chat_memory.messages:
        return None

    for msg in reversed(memory.chat_memory.messages):
        if "User selected course:" in msg.content:
            return (
                msg.content
                .split("User selected course:")[1]
                .split(".")[0]
                .strip()
                .lower()
            )
    return None


def handle_short_intent(user_message, memory, submitted_users, user_id):
    """
    Works EXACTLY like syllabus detection.
    If fees → ask for form
    """

    intent = detect_short_intent(user_message)
    if not intent:
        return None

    course = get_last_selected_course(memory)
    if not course or course not in COURSES:
        return None

    # 🔥 FEES → SAME FLOW AS SYLLABUS
    if intent == "fees":

        if user_id not in submitted_users:
            return {
                "response": (
                    f"I can share the <strong>{course.title()}</strong> fee details with you.<br>"
                    f"Please fill your details 😊"
                ),
                "need_details": True,
                "course": course
            }

        pdf = COURSES[course]
        return {
            "response": (
                f"Here are the details for"
                f"<strong>{course.title()}</strong> 📄:<br>"
                f"<a href='/static/pdfs/{pdf}' target='_blank'>Download PDF</a>"
            ),
            "need_details": False
        }
        
    if intent == "career opportunities":

        if user_id not in submitted_users:
            return {
                "response": (
                    f"I can share the <strong>{course.title()}</strong> career opportunities with you 💰.<br>"
                    f"Please fill your details 😊"
                ),
                "need_details": True,
                "course": course
            }

        pdf = COURSES[course]
        return {
            "response": (
                f"Here are the career opportunities for "
                f"<strong>{course.title()}</strong> 📄:<br>"
                f"<a href='/static/pdfs/{pdf}' target='_blank'>Download PDF</a>"
            ),
            "need_details": False
        }
    if intent == "duration":

        if user_id not in submitted_users:
            return {
                "response": (
                    f"I can share the <strong>{course.title()}</strong> duration with you 💰.<br>"
                    f"Please fill your details 😊"
                ),
                "need_details": True,
                "course": course
            }

        pdf = COURSES[course]
        return {
            "response": (
                f"Here are the duration details for "
                f"<strong>{course.title()}</strong> 📄:<br>"
                f"<a href='/static/pdfs/{pdf}' target='_blank'>Download PDF</a>"
            ),
            "need_details": False
        }        

    return None
