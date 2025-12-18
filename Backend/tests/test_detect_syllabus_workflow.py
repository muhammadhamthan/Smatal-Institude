from syllabus_utils import detect_syllabus_request
import syllabus_utils

def test_detect_syllabus_python(mocker):
    mocker.patch(
        "syllabus_utils.ChatGoogleGenerativeAI.invoke",
        return_value=type("MockResponse", (), {"content": '{"is_syllabus_request": true, "course": "python"}'})
    )

    result = detect_syllabus_request("Can you give me python syllabus?")
    assert result == "python"


    message = "Can you give me python syllabus?"
    result = detect_syllabus_request(message)
    assert result == "python"
    
def test_detect_no_syllabus(mocker):
    mocker.patch(
        "syllabus_utils.ChatGoogleGenerativeAI.invoke",
        return_value=type("MockResponse", (), {"content": '{"is_syllabus_request": false, "course": ""}'})
    )

    message = "Hello how are you?"
    result = detect_syllabus_request(message)
    assert result is None
    
