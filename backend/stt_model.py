import requests
from dotenv import load_dotenv
import os
import tempfile
from pydub import AudioSegment
import pyaudio
import wave
import numpy as np
from collections import deque
import threading
import json
from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
)

load_dotenv()

app = FastAPI()
# Audio recording settings
CHUNK = 1024  # Buffer size
FORMAT = pyaudio.paInt16  # 16-bit audio format
CHANNELS = 1  # Mono
RATE = 44100  # Sample rate (44.1kHz)
CHUNK_DURATION = CHUNK / RATE  # Duration of one chunk
RECORD_SECONDS = 5  # Length of each audio chunk to process
OVERLAP_SECONDS = 1  # Overlap duration


# Transcription using sarvam AI
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


# chunking audio for an audio file


import tempfile
import os

# Audio recording settings
CHUNK = 1024  # Buffer size
FORMAT = pyaudio.paInt16  # 16-bit audio format
CHANNELS = 1  # Mono
RATE = 44100  # Sample rate (44.1kHz)
RECORD_SECONDS = 5  # Recording length per chunk
OVERLAP_SECONDS = 1
audio_buffer = deque(maxlen=int(RATE * (RECORD_SECONDS + OVERLAP_SECONDS) / CHUNK))


def extract_and_process():
    """Extracts 5-second chunks from the queue and processes them while keeping the mic open."""
    while True:
        if len(audio_buffer) * CHUNK_DURATION >= RECORD_SECONDS:
            frames = list(audio_buffer)[
                : int(RATE * RECORD_SECONDS / CHUNK)
            ]  # Extract chunk

            # Create a temp file and process it
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file_path = temp_file.name
                with wave.open(temp_file_path, "wb") as wf:
                    wf.setnchannels(CHANNELS)
                    wf.setsampwidth(pyaudio.PyAudio().get_sample_size(FORMAT))
                    wf.setframerate(RATE)
                    wf.writeframes(b"".join(frames))

            try:
                transcribe(temp_file_path)
            finally:
                os.remove(temp_file_path)  # Cleanup

            # Maintain overlap by keeping the last portion in the buffer
            overlap_samples = int(RATE * OVERLAP_SECONDS / CHUNK)
            for _ in range(overlap_samples):
                if audio_buffer:
                    audio_buffer.popleft()

#Mic reording function
def record_mic():
    """Continuously records audio and stores it in a queue."""
    audio = pyaudio.PyAudio()
    stream = audio.open(
        format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
    )

    print("Recording... Speak now!")

    # Start the processing thread
    threading.Thread(target=extract_and_process, daemon=True).start()

    try:
        while True:
            data = stream.read(CHUNK)
            audio_buffer.append(data)  # Keep adding to the buffer
    except KeyboardInterrupt:
        print("\nRecording stopped.")
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()


# Start recording
record_mic()
