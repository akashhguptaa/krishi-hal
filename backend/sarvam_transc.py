import requests
import json
import os
from dotenv import load_dotenv
import json

load_dotenv()


def transcribe(temp_file_path):
    """Sends the audio file to the transcription API."""
    url = "https://api.sarvam.ai/speech-to-text-translate"
    payload = {"model": "saaras:v1", "prompt": ""}
    
    with open(temp_file_path, "rb") as f:
        files = [("file", ("file", f, "audio/wav"))]
        headers = {"api-subscription-key": os.getenv("SARVAM_KEY")}
        response = requests.post(url, headers=headers, data=payload, files=files)
        data = json.dumps(response.text)
        # print(data)
        if response.status_code == 200:
            try:
                data = response.json()  # Parse the JSON response
                print(data["transcript"])
            except json.JSONDecodeError:
                print("Error decoding JSON response.")
        else:
            print(f"API error: {response.status_code} - {response.text}")
