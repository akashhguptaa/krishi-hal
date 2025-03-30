import pyaudio
from collections import deque

from sarvam_transc import transcribe

import tempfile
import wave
import os

def extract_and_process():
    CHUNK = 1024  # Buffer size
    FORMAT = pyaudio.paInt16  # 16-bit audio format
    CHANNELS = 1  # Mono
    RATE = 44100  # Sample rate (44.1kHz)
    CHUNK_DURATION = CHUNK / RATE  # Duration of one chunk
    RECORD_SECONDS = 5  # Length of each audio chunk to process
    OVERLAP_SECONDS = 1  # Overlap duration

    """Extracts 5-second chunks from the queue and processes them while keeping the mic open."""
    while True:
        if len(audio_buffer) * CHUNK_DURATION >= RECORD_SECONDS:
            frames = list(audio_buffer)[:int(RATE * RECORD_SECONDS / CHUNK)]  # Extract chunk

            # Create a temp file and process it
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file_path = temp_file.name
                with wave.open(temp_file_path, 'wb') as wf:
                    wf.setnchannels(CHANNELS)
                    wf.setsampwidth(pyaudio.PyAudio().get_sample_size(FORMAT))
                    wf.setframerate(RATE)
                    wf.writeframes(b''.join(frames))

            try:
                transcribe(temp_file_path)
            finally:
                os.remove(temp_file_path)  # Cleanup

            # Maintain overlap by keeping the last portion in the buffer
            overlap_samples = int(RATE * OVERLAP_SECONDS / CHUNK)
            for _ in range(overlap_samples):
                if audio_buffer:
                    audio_buffer.popleft()