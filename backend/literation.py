import requests
import os
from dotenv import load_dotenv
import json
import requests

load_dotenv()


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


def transliteration(text):
    url = "https://api.sarvam.ai/transliterate"

    payload = {
        "input": text,
        "source_language_code": "auto",
        "target_language_code": "hi-IN",
        "numerals_format": "international",
        "spoken_form_numerals_language": "native",
        "spoken_form": False,
    }
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": os.getenv("SARVAM_KEY"),
    }

    response = requests.request("POST", url, json=payload, headers=headers)
    chunks = split_text(text)
    transittered_chunks = []
    
    for chunk in chunks:
        payload = payload.copy()
        payload["input"] = chunk
        
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        if "transliterated_text" in data:
            transittered_chunks.append(data["transliterated_text"])
        else:
            print(f"Error: {data}")
    return " ".join(transittered_chunks)
    

if __name__=="__main__":
    text = "Namaste doston! Aaj hum baat karenge ek aise topic par jo har kisi ke liye zaroori hai – apni sehat ka khayal rakhna. Hum sab apne daily routine mein kaafi busy rehte hain, lekin apni sehat ka dhyaan rakhna utna hi zaroori hai. Agar hum apni diet, exercise, aur mental health par focus karein, toh hum apni zindagi ko behtar bana sakte hain. Har din thoda waqt apne liye nikaalna chahiye – chahe wo ek walk ho, meditation ho, ya phir healthy khana khana. Humare chhote chhote decisions, jaise ki pani peena, achi neend lena, aur stress ko handle karna, humari sehat ko sudharte hain. Toh doston, aaj se apni sehat par dhyaan dena shuru karo, kyunki sehat hi hai sabse badi daulat."
    print(type(transliteration(text)))