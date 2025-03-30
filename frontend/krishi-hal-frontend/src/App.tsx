import { useState, useRef, useEffect } from "react";

const audioContext = new AudioContext(); // Single instance

function App() {
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8005/ws/transcription");

    ws.current.onopen = () => console.log("WebSocket Connected");
    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.current?.close();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        console.error("Invalid file type. Please upload an audio file.");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const monoAudioBuffer = convertToMono(audioBuffer);
          const chunks = createAudioChunks(monoAudioBuffer, 3, 1);

          for (const chunk of chunks) {
            sendChunkToBackend(chunk);
          }
        } catch (error) {
          console.error("Error decoding audio:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const arrayBuffer = await audioBlob.arrayBuffer();

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const monoAudioBuffer = convertToMono(audioBuffer);
          const chunks = createAudioChunks(monoAudioBuffer, 3, 1);

          for (const chunk of chunks) {
            sendChunkToBackend(chunk);
          }
        } catch (error) {
          console.error("Error processing recorded audio:", error);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const convertToMono = (audioBuffer: AudioBuffer) => {
    const monoBuffer = audioContext.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const monoData = monoBuffer.getChannelData(0);
    const numChannels = audioBuffer.numberOfChannels;

    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < numChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i];
      }
      monoData[i] = sum / numChannels;
    }
    return monoBuffer;
  };

  const createAudioChunks = (
    audioBuffer: AudioBuffer,
    chunkDuration: number,
    overlapDuration: number
  ) => {
    if (overlapDuration >= chunkDuration) {
      throw new Error("Overlap duration must be smaller than chunk duration");
    }

    const chunks: AudioBuffer[] = [];
    const sampleRate = audioBuffer.sampleRate;
    const totalSamples = audioBuffer.length;

    const chunkSize = chunkDuration * sampleRate;
    const overlapSize = overlapDuration * sampleRate;
    const stepSize = chunkSize - overlapSize;

    for (let start = 0; start < totalSamples; start += stepSize) {
      const end = Math.min(start + chunkSize, totalSamples);
      const chunk = audioContext.createBuffer(1, end - start, sampleRate);

      const chunkData = chunk.getChannelData(0);
      const originalData = audioBuffer.getChannelData(0);

      for (let i = start; i < end; i++) {
        chunkData[i - start] = originalData[i];
      }

      chunks.push(chunk);
    }

    return chunks;
  };

  const resampleAndConvertToInt16 = (audioBuffer: AudioBuffer) => {
    const targetSampleRate = 16000;
    const originalSampleRate = audioBuffer.sampleRate;
    const audioData = audioBuffer.getChannelData(0);

    const ratio = targetSampleRate / originalSampleRate;
    const newLength = Math.round(audioData.length * ratio);
    const resampledData = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const index = Math.round(i / ratio);
      resampledData[i] = audioData[Math.min(index, audioData.length - 1)];
    }

    // Convert Float32 to Int16
    const int16Array = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
      int16Array[i] = Math.max(
        -32768,
        Math.min(32767, resampledData[i] * 32768)
      );
    }

    return int16Array;
  };

  const sendChunkToBackend = (audioChunk: AudioBuffer) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const int16Array = resampleAndConvertToInt16(audioChunk);

    // Convert Int16Array to Base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(int16Array.buffer))
    );

    ws.current.send(base64Audio);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-5xl">Transcribe Here</p>

      <input type="file" onChange={handleFileChange} accept="audio/*" />

      {selectedFile && (
        <div>
          <p>File Name: {selectedFile.name}</p>
          <p>File Size: {(selectedFile.size / 1_000_000).toFixed(2)} MB</p>
          <p>File Type: {selectedFile.type}</p>
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`mt-4 px-4 py-2 text-white rounded-lg ${
          isRecording ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

export default App;
