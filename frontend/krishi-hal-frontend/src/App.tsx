import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket.tsx";
import { useAudioRecorder } from "./hooks/useAudioRecorder.tsx";
import {
  convertToMono,
  createAudioChunks,
  resampleAndConvertToInt16,
} from "./utils/audioUtils.tsx";

const audioContext = new AudioContext();

export default function App() {
  const { send } = useWebSocket("ws://localhost:8005/ws/transcription");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleProcessAudio = async (audioBuffer: AudioBuffer) => {
    const monoBuffer = convertToMono(audioContext, audioBuffer);
    const chunks = createAudioChunks(audioContext, monoBuffer, 3, 1);

    chunks.forEach((chunk) => {
      const int16Array = resampleAndConvertToInt16(chunk);
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(int16Array.buffer))
      );
      send(base64Audio);
    });
  };

  const { startRecording, stopRecording, isRecording } =
    useAudioRecorder(handleProcessAudio);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      console.error("Invalid file ty  pe");
      return;
    }

    setSelectedFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    handleProcessAudio(audioBuffer);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-5xl">Transcribe Here</p>

      <input type="file" onChange={handleFileChange} accept="audio/*" />

      {selectedFile && (
        <div>
          <p>File Name: {selectedFile.name}</p>
          <p>File Size: {(selectedFile.size / 1_000_000).toFixed(2)} MB</p>
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
