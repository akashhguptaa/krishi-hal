import os
import tempfile
import wave
import numpy as np
from collections import deque
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import base64
import threading
import time
from ex_transc import extract_and_process  # Ensure this function exists
import uvicorn
from sarvam_transc import transcribe

app = FastAPI()
conversation_history = []

@app.websocket("/ws/transcription")
async def websocket_transcription(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    
    try:
        chunk_count = 0
        while True:
            # Receive base64 encoded audio data
            base64_audio = await websocket.receive_text()
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(base64_audio)
            
            # Convert to int16 PCM data
            int16_array = np.frombuffer(audio_bytes, dtype=np.int16)
            
            # Safely add new samples to the buffer
            
            with buffer_lock:
                audio_buffer.extend(int16_array)
            
            print(f"Received audio chunk {chunk_count}, buffer size: {len(audio_buffer)}")
            chunk_count += 1

            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)