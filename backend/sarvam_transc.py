import requests
import json
import os
from dotenv import load_dotenv
import json
import base64
import time
from chat_res import chat

load_dotenv()

conversation_history = []

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




def speak(output_text, output_filename="output.wav"):
    url = "https://api.sarvam.ai/text-to-speech"

    payload = {
        "inputs": [output_text],
        "target_language_code": "hi-IN",
        "speaker": "anushka",
        "speech_sample_rate": 16000,
        "enable_preprocessing": True,
        "model": "bulbul:v2",
    }
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": os.getenv("SARVAM_KEY"),
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        response_json = response.json()

        # Extract the base64 audio content (Modify this based on the actual API response structure)
        audio_base64 = str(response_json["audios"])  # Parse the JSON response
        # print(data["audios"])
        print(audio_base64)
        if audio_base64:
            # Decode base64 and save as a WAV file
            audio_data = base64.b64decode(audio_base64)
            with open(output_filename, "wb") as wav_file:
                wav_file.write(audio_data)

            print(f"Audio saved successfully as {output_filename}")
        else:
            print("Error: No audio content found in the response.")
    else:
        print(f"Error: {response.status_code}, {response.text}")


# Example Usage
data = "यहाँ एक छोटी हिंदी स्क्रिप्ट है, जो एक दोस्ती के खूबसूरत पल को दर्शाती है।"
data = "There's a small hindi script, which demonstrates some pleasent moments of a friendship"

import requests


def translate(text):
    url = "https://api.sarvam.ai/translate"

    payload = {
        "input": text,
        "source_language_code": "auto",
        "target_language_code": "hi-IN",
        "speaker_gender": "Female",
        "mode": "formal",
        "model": "mayura:v1",
        "enable_preprocessing": False,
        "output_script": "roman",
        "numerals_format": "international",
    }
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": os.getenv("SARVAM_KEY"),
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    data = response.json()  # Parse the JSON response
    translated_text = data["translated_text"]
    speak(str(translated_text))

def initiate_conversation(text):
    conversation_history = []
    res = chat(text, conversation_history)
    print(res)
    translate(str(res))

ques = "Tell me about elon musk keep it short"
initiate_conversation(ques)