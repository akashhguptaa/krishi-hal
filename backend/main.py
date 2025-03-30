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
import base64
import asyncio

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




# chunking audio for an audio file


import tempfile
import os



# Mic reording function
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


@app.websocket("/ws")
async def transcription(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_json()
            file_key = message.get("key")
            chunk_base64 = message.get("chunk")
            final_chunk = message.get("final", False)

            if not file_key or not chunk_base64:
                await websocket.send_json(
                    {"error": "Invalid message: missing 'key' or 'chunk'."}
                )
                continue

            try:
                chunk_bytes = base64.b64decode(chunk_base64)
            except Exception as decode_err:
                print(f"Decoding error for key {file_key}: {decode_err}")
                await websocket.send_json(
                    {"key": file_key, "error": "Failed to decode audio chunk."}
                )
                continue

            asyncio.create_task(
                extract_and_process(chunk_bytes, final_chunk, file_key, websocket)
            )

    except WebSocketDisconnect:
        print("WebSocket disconnected")
