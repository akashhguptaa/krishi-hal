import os
import requests
import base64
import wave
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()


def chunk_text(text, max_length=300):
    """Splits text into chunks of max_length characters without breaking words."""
    words = text.split()
    chunks = []
    current_chunk = ""

    for word in words:
        if len(current_chunk) + len(word) + 1 <= max_length:
            current_chunk += " " + word if current_chunk else word
        else:
            chunks.append(current_chunk)
            current_chunk = word

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def speak(output_text):
    url = "https://api.sarvam.ai/text-to-speech"

    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": os.getenv("SARVAM_KEY"),
    }

    chunks = chunk_text(output_text)
    audio_segments = []

    for chunk in chunks:
        payload = {
            "inputs": [chunk],
            "target_language_code": "hi-IN",
            "speaker": "anushka",
            "speech_sample_rate": 16000,
            "enable_preprocessing": True,
            "model": "bulbul:v2",
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            response_json = response.json()
            audio_list = response_json.get("audios", [])
            audio_base64 = (
                "".join(audio_list) if isinstance(audio_list, list) else audio_list
            )

            if audio_base64:
                audio_data = base64.b64decode(audio_base64)
                yield audio_data
                audio_segments.append(audio_data)
            else:
                print("Error: No audio content found in the response.")
        else:
            print(f"Error: {response.status_code}, {response.text}")
            return

    # Combine audio segments
    # if audio_segments:
    #     with wave.open(output_filename, "wb") as output_wav:
    #         with wave.open(BytesIO(audio_segments[0]), "rb") as first_wav:
    #             output_wav.setparams(first_wav.getparams())  # Copy audio parameters

    #         for segment in audio_segments:
    #             with wave.open(BytesIO(segment), "rb") as wav_file:
    #                 output_wav.writeframes(wav_file.readframes(wav_file.getnframes()))

    #     print(f"Audio saved successfully as {output_filename}")
    # else:
    #     print("Error: No audio segments were generated.")


if __name__ == "__main__":

    text = "सुप्रभात, सभी को मेरा नमस्कार! आज मैं परिश्रम और संकल्प की शक्ति के बारे में बात करना चाहता हूँ।"
    speak(text)
