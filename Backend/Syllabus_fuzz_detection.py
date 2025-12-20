from rapidfuzz import process, fuzz
import re
from course_details import COURSES
from Syllabus_keywords import SYLLABUS_KEYWORDS, EXCLUSION_KEYWORDS


def normalize(text: str) -> str:
    print("Normalizing text:", text)
    return re.sub(r"[^a-z0-9 ]", "", text.lower())

def detect_syllabus_request(user_message: str):
    text = normalize(user_message)
    print("fuzz detection text:", text)

    # 1️⃣ Check exclusion first (hard block)
    for word in EXCLUSION_KEYWORDS:
        if word in text:
            print("Exclusion keyword found:", word)
            return None

    # 2️⃣ Check syllabus intent keywords
    if not any(keyword in text for keyword in SYLLABUS_KEYWORDS):
        print("No syllabus intent keywords found.")
        return None

    # 3️⃣ Fuzzy match course name
    courses = list(COURSES.keys())
    match, score, _ = process.extractOne(
        text,
        courses,
        scorer=fuzz.partial_ratio
    )
    print(f"Fuzzy match result: {match} with score {score}")
    # 4️⃣ Confidence threshold
        # 4️⃣ Confidence threshold
    if score >= 70:
        return match

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
