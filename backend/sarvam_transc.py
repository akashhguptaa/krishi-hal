import requests
import json
import os
from dotenv import load_dotenv
import json
from chat_res import chat
from TTS import speak
from loguru import logger
load_dotenv()
import re


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


def split_text(text, max_length=800):
    chunks = []
    while text:
        split_index = min(max_length, len(text))
        if split_index < len(text):
            last_space = text.rfind(" ", 0, split_index)
            if last_space != -1:
                split_index = last_space
        chunks.append(text[:split_index].strip())
        text = text[split_index:].strip()
    return chunks

def preprocess_text(text):
    """
    Cleans and preprocesses the given Hindi text for better TTS output.
    - Removes unnecessary punctuation and formatting markers.
    - Converts special characters to plain text.
    - Splits text into structured, meaningful sentences.
    """
    # Remove unwanted symbols like **, extra spaces, and special characters
    text = re.sub(r"\*\*|\*|[\[\](){}]", "", text)
    
    # Replace multiple spaces or dots with a single space
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\.{2,}", ".", text)
    
    # Add line breaks for structured readability
    replacements = {
        "Kya aap iss bare mein soch rahe hain ki": "\nKya aap is baare mein soch rahe hain:\n",
        "Zameen:": "\n4. Zameen –"
    }
    
    for key, value in replacements.items():
        text = text.replace(key, value)
    
    return text.strip()

def translate(text):
    url = "https://api.sarvam.ai/translate"
    
    payload_template = {
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
    
    chunks = split_text(text)
    translated_chunks = []
    
    for chunk in chunks:
        payload = payload_template.copy()
        payload["input"] = chunk
        
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        if "translated_text" in data:
            translated_chunks.append(data["translated_text"])
        else:
            print(f"Error: {data}")
    
    return preprocess_text(" ".join(translated_chunks))

def initiate_conversation(text):
    conversation_history = []
    res = chat(text, conversation_history)
    print(res)
    translated_text = translate(str(res))
    text = preprocess_text(translated_text)

    speak(text)

if __name__ == "__main__":
    ques = "Okay, let's talk about what's needed for farming! "
    initiate_conversation(ques)
