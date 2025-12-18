# import requests

# client_id = "YOUR_CLIENT_ID"
# client_secret = "YOUR_CLIENT_SECRET"
# redirect_uri = "YOUR_REDIRECT_URI"
# grant_code = "PASTE_THE_CODE_HERE"  # the "code" you received

# token_url = "https://accounts.zoho.in/oauth/v2/token"

# payload = {
#     "grant_type": "authorization_code",
#     "client_id": "1000.3FT1HPPOAXB5XF4166PNSTTN7QG8JK",
#     "client_secret": "f7b95300d22a7b3fb2cca8529de2a4251992bac247",
#     "code": "1000.c6d0748d506fc4fea4d7f6fc649f97bd.c986add5054f76729c7706788d72fc4e"
# }

# response = requests.post(token_url, data=payload)

# print("Response:")
# print(response.json())

from dotenv import load_dotenv
import os
load_dotenv()
print(os.getenv("GOOGLE_SHEET_CREDENTIALS_JSON"))