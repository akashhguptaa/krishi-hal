import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket.tsx";
import { useAudioRecorder } from "./hooks/useAudioRecorder.tsx";
import {
  convertToMono,
  createAudioChunks,
  resampleAndConvertToInt16,
} from "./utils/audioUtils.tsx";
import { motion } from "framer-motion";

const audioContext = new AudioContext();

export default function App() {
  const { send } = useWebSocket("ws://localhost:8005/ws/transcription");
  const [imgs, setImgs] = useState<string | null>(null);

  const handleChangesImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    //send signal
    send("END_OF_TRANSMISSION");
  };

  const { startRecording, stopRecording, isRecording } =
    useAudioRecorder(handleProcessAudio);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <h1 className="text-4xl font-extrabold text-green-700 text-center drop-shadow-lg">
        Krishi-Hal
      </h1>
      <p className="text-md text-green-600 text-center mt-2">
        Your Smart Farming Assistant
      </p>

      <div className="mt-6 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-green-200">
        <h2 className="text-xl font-semibold text-green-700">Response</h2>
        <p className="bg-green-100 p-4 rounded-lg mt-3 text-sm text-green-900">
          Based on the information provided, your crops appear to be in good
          health. The soil moisture levels are optimal, but you might want to
          consider applying nitrogen-rich fertilizer within the next week for
          better yield.
        </p>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className="w-20 h-20 flex items-center justify-center rounded-full transition-all shadow-lg text-white text-lg"
          style={{
            backgroundColor: isRecording ? "#dc2626" : "#16a34a",
          }}
          whileTap={{ scale: 0.9 }}
          animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
        >
          {isRecording ? "■" : "🎤"}
        </motion.button>
        <p className="mt-3 text-sm text-green-700">
          {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
        </p>
      </div>

      <div className="mt-6 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-green-200">
        <h2 className="text-xl font-semibold text-green-700">
          Upload Farm Image
        </h2>
        <input
          type="file"
          onChange={handleChangesImages}
          className="mt-3 w-full border p-3 rounded-lg text-sm text-gray-700"
        />
        {imgs && (
          <img
            src={imgs}
            className="mt-4 rounded-lg shadow-md border border-green-300"
            alt="Uploaded preview"
          />
        )}
      </div>
    </div>
  );
}
