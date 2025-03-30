import os
import numpy as np
import soundfile as sf
import base64
import tempfile
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from loguru import logger

app = FastAPI()

audio_buffer = []  # Buffer to accumulate audio chunks

@app.websocket("/ws/transcription")
async def websocket_transcription(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connected")

    try:
        while True:
            base64_audio = await websocket.receive_text()
            logger.info("Received audio chunk")

            try:
                # Decode Base64 to bytes
                audio_bytes = base64.b64decode(base64_audio)

                # Convert bytes to int16 array
                int16_array = np.frombuffer(audio_bytes, dtype=np.int16)

                # Append to buffer
                audio_buffer.append(int16_array)

            except base64.binascii.Error as e:
                logger.error(f"Base64 decoding error: {e}")
            except ValueError as e:
                logger.error(f"Invalid audio format received: {e}")

    except WebSocketDisconnect:
        logger.warning("WebSocket disconnected unexpectedly.")

        if audio_buffer:
            temp_file_path = save_audio_to_temp_file(audio_buffer)
            logger.success(f"Temporary file created: {temp_file_path}")

            # You can now pass `temp_file_path` to further processing functions

            # Clear buffer after processing
            audio_buffer.clear()

        else:
            logger.warning("No audio data received before disconnection.")

    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")

def save_audio_to_temp_file(audio_chunks):
    """Combines chunks and saves as a temporary WAV file."""
    if not audio_chunks:
        logger.warning("No audio chunks to save.")
        return None

    try:
        # Create a temporary file in write-binary mode
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file_path = temp_file.name  # Get temp file path
        temp_file.close()  # Close file so we can write to it later

        # Combine all chunks
        combined_audio = np.concatenate(audio_chunks, axis=0)

        # Save using soundfile (16-bit PCM WAV, mono, 16kHz)
        sf.write(temp_file_path, combined_audio, samplerate=16000, subtype="PCM_16")

        logger.success(f"Audio saved temporarily at: {temp_file_path}")

        return temp_file_path  # Return temp file path for further processing

    except Exception as e:
        logger.error(f"Error saving temp audio file: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
