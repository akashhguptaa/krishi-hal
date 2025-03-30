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

       // Extract Base64 data (remove the data URL prefix)
       const base64String = imageData.split(",")[1];

       // Send Base64 to FastAPI endpoint
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
      <div>
        <input type="file" onChange={handleChangesImages} />
        <br />
        {imgs && (
          <img src={imgs} height="200px" width="200px" alt="Uploaded preview" />
        )}
      </div>
    </div>
  );
}
