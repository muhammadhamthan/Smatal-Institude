import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials

CREDENTIALS_JSON = os.getenv("GOOGLE_SHEET_CREDENTIALS_JSON", "")
try:
    creds_dict = json.loads(CREDENTIALS_JSON) if CREDENTIALS_JSON else None
except json.JSONDecodeError:
    creds_dict = None

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credintials = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict,scope)

client = gspread.authorize(credintials)

sheet = client.open("Smatal-Acadmy-user-detail's").sheet1

def append_row_to_sheet(row_data):
    """
    Appends a row of user data to the Google Sheet.

    Args:
        row_data (list): A list containing user info like [Name, Email, Phone, Course, User_ID]
    Returns:
        str: Success or error message
    """
    try:
        sheet.append_row(row_data)
        return "Success"
    except Exception as e:
        print("Error writing to Google Sheet:", str(e))
        return f"Error: {str(e)}"