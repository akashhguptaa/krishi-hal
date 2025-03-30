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
  const [imgs, setImgs] = useState<string | null>(null);

  const handleChangesImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const imageData = reader.result as string;
        setImgs(imageData);
        const base64String = imageData.split(",")[1];

        try {
          const response = await fetch("http://localhost:8005/upload-image/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ base64_image: base64String }),
          });

          const result = await response.json();
          if (response.ok) {
            console.log("Image uploaded successfully:", result.file_path);
          } else {
            console.error("Error uploading image:", result.detail);
          }
        } catch (error) {
          console.error("Network error:", error);
        }
      };

      reader.readAsDataURL(file);
    }
  };

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

  const { startRecording, stopRecording, isRecording } = useAudioRecorder(handleProcessAudio);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      console.error("Invalid file type");
      return;
    }

    setSelectedFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    handleProcessAudio(audioBuffer);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-5xl font-bold text-blue-600 mb-6">Krishi-Hal</h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Upload Audio</h2>
        <input type="file" onChange={handleFileChange} accept="audio/*" className="mb-4 w-full border p-2 rounded-lg" />
        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p><strong>File Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1_000_000).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`mt-6 px-6 py-3 text-white rounded-2xl transition-all shadow-md ${
          isRecording ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg mt-6">
        <h2 className="text-xl font-semibold mb-3">Upload Image</h2>
        <input type="file" onChange={handleChangesImages} className="mb-4 w-full border p-2 rounded-lg" />
        {imgs && <img src={imgs} className="rounded-lg shadow-md" alt="Uploaded preview" />}
      </div>
    </div>
  );
}
