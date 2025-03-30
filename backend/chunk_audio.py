def chunk_audio(file_path, chunk_length_ms=5000, overlap_ms=1000):
    
    audio = AudioSegment.from_wav(file_path)
    step_size = chunk_length_ms - overlap_ms
    chunks = [audio[i:i + chunk_length_ms] for i in range(0, len(audio), step_size)]

    for idx, chunk in enumerate(chunks):
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            chunk.export(temp_file.name, format="wav")
            temp_file_path = temp_file.name  # Get the file path as a string
        
        try:
            transcribe(temp_file_path)
        finally:
            os.remove(temp_file_path)  # Ensure the file is deleted after processing