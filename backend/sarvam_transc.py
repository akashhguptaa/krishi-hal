import requests
import json
import os
from dotenv import load_dotenv
import json
from chat_res import chat
from TTS import speak
from loguru import logger
load_dotenv()


def transcribe(temp_file_path, conversation_history=[]):
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
                return data["transcript"]
            except json.JSONDecodeError:
                print("Error decoding JSON response.")
        else:
            print(f"API error: {response.status_code} - {response.text}")


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
    logger.info(translated_text)
    speak(str(translated_text))


def initiate_conversation(text):
    conversation_history = []
    res = chat(text, conversation_history)
    print(res)
    translate(str(res))


if __name__ == "__main__":
    ques = "Tell me about elon musk keep it short"
    initiate_conversation(ques)
