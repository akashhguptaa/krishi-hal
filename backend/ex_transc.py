import pyaudio
from collections import deque
import tempfile
import wave
import os
import numpy as np
from sarvam_transc import transcribe  # Ensure this function exists

def extract_and_process(audio_buffer):
    """Extracts 5-second chunks from the queue, processes them, and keeps the mic open."""

    CHUNK = 1024  # Buffer size
    FORMAT = pyaudio.paInt16  # 16-bit PCM format
    CHANNELS = 1  # Mono audio
    RATE = 44100  # Sample rate (44.1 kHz)
    RECORD_SECONDS = 5  # Each chunk should be 5 seconds
    OVERLAP_SECONDS = 1  # Overlap duration

    samples_per_chunk = RATE * RECORD_SECONDS  # Total samples in 5 seconds
    overlap_samples = RATE * OVERLAP_SECONDS  # Overlap duration in samples

    while True:
        if len(audio_buffer) >= samples_per_chunk:
            # Extract the latest 5 seconds of audio
            frames = [audio_buffer.popleft() for _ in range(samples_per_chunk)]

            # Convert frames to raw PCM bytes
            audio_data = np.array(frames, dtype=np.int16).tobytes()

            # Save to a temporary WAV file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file_path = temp_file.name
                with wave.open(temp_file_path, "wb") as wf:
                    wf.setnchannels(CHANNELS)
                    wf.setsampwidth(pyaudio.PyAudio().get_sample_size(FORMAT))
                    wf.setframerate(RATE)
                    wf.writeframes(audio_data)

            try:
                transcribe(temp_file_path)  # Send for transcription
            finally:
                os.remove(temp_file_path)  # Cleanup temp file

            # Keep the last `overlap_samples` in the buffer to maintain overlap
            while len(audio_buffer) > overlap_samples:
                audio_buffer.popleft()


if __name__ == "__main__":
    pass
