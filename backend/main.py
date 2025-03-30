import os
import numpy as np
import soundfile as sf
import base64
import tempfile
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from loguru import logger
from sarvam_transc import transcribe, translate
from chat_res import chat
from TTS import speak

app = FastAPI()
transcription_results = []  # Accumulate transcription results
communication_history = []

@app.websocket("/ws/transcription")
async def websocket_transcription(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connected")

    try:
        while True:
            base64_audio = await websocket.receive_text()
            logger.info("Received audio chunk")

            if base64_audio:
                try:
                    # Decode Base64 to bytes
                    audio_bytes = base64.b64decode(base64_audio)
                    
                    # Convert bytes to int16 array
                    int16_array = np.frombuffer(audio_bytes, dtype=np.int16)
                    
                    # Save chunk as a temporary WAV file
                    temp_file_path = save_chunk_to_temp_file(int16_array)
                    if temp_file_path:
                        transcription = transcribe(temp_file_path)
                        transcription_results.append(transcription)
                        logger.success(f"Transcribed chunk: {transcription}")
                
                except base64.binascii.Error as e:
                    logger.error(f"Base64 decoding error: {e}")
                except ValueError as e:
                    logger.error(f"Invalid audio format received: {e}")
            else:
                # No more audio chunks received, process final transcription
                final_transcription = " ".join(transcription_results)
                logger.success(f"Final transcription: {final_transcription}")
                transcription_results.clear()
                
                # Get response from chat function
                chat_response = chat(final_transcription, communication_history)
                logger.success(f"Chat response: {chat_response}")
                
                # Translate and convert to speech
                for translated_text in translate(chat_response):
                    audio_base64 = speak(translated_text)
                    if audio_base64:
                        await websocket.send_text(audio_base64)
                        logger.success("Sent translated speech to frontend")
                break

    except WebSocketDisconnect:
        logger.warning("WebSocket disconnected unexpectedly.")
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")

def save_chunk_to_temp_file(audio_chunk):
    """Saves an audio chunk as a temporary WAV file."""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file_path = temp_file.name
        temp_file.close()

        # Save using soundfile (16-bit PCM WAV, mono, 16kHz)
        sf.write(temp_file_path, audio_chunk, samplerate=16000, subtype="PCM_16")
        logger.success(f"Chunk saved temporarily at: {temp_file_path}")
        return temp_file_path

    except Exception as e:
        logger.error(f"Error saving temp audio file: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
