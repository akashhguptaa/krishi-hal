// AppHome.tsx
import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket.tsx";
import { useAudioRecorder } from "./hooks/useAudioRecorder.tsx";
import {
  convertToMono,
  createAudioChunks,
  resampleAndConvertToInt16,
} from "./utils/audioUtils.tsx";
import Weather from "./components/Weather.tsx";
import { useNavigate } from "react-router-dom";
import { tr } from "framer-motion/client";

const audioContext = new AudioContext();

export default function AppHome() {
  const { send, audioURL, transcript } = useWebSocket(
    "ws://localhost:8005/ws/transcription"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [inference, setInference] = useState<String | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          console.log("Latitude:", latitude, "Longitude:", longitude);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const imageData = reader.result as string;
        setImagePreview(imageData);
        const base64String = imageData.split(",")[1];

        try {
          const response = await fetch("http://localhost:8005/upload-image/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64_image: base64String }),
          });

          const result = await response.json();
          console.log(result);

          if (response.ok) {
            console.log("Image uploaded successfully:", result.file_path);
            setPredictionResult(
              result.prediction?.predicted_class || "Unknown Disease"
            );
            setInference(
                result.response
            )
          } else {
            console.error("Error uploading image:", result.detail);
            setPredictionResult("Error retrieving prediction");
          }
        } catch (error) {
          console.error("Network error:", error);
          setPredictionResult("Network error");
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

    send("END_OF_TRANSMISSION");
  };

  const { startRecording, stopRecording, isRecording } =
    useAudioRecorder(handleProcessAudio);

  return (
    <div
      className="relative max-w-sm mx-auto h-screen overflow-y-auto"
      style={{ background: "linear-gradient(to bottom, #91C4D0, #1C551C)" }}
    >
      {/* Top banner */}
      <div className="relative w-full h-32">
        <img
          src="logo123.png"
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main content area */}
      <div className="h-[calc(100%-128px)] p-4 flex flex-col gap-4 ">
        <button
          onClick={() => navigate("/farmer-health")}
          className="px-6 py-3 bg-green-700 text-white rounded-xl shadow-lg hover:bg-green-800 transition font-semibold"
        >
          Farmer's History
        </button>
        {/* Weather Section */}
        <Weather />
        {/* Image Upload Section */}
        <div className="bg-white rounded-3xl p-3 shadow-md flex flex-col items-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Uploaded Preview"
              className="w-full aspect-square object-cover rounded-lg"
            />
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-200 transition">
              <span className="text-gray-600 text-sm">
                Click to Upload Image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
          {predictionResult && (
            <p className="text-center text-sm text-gray-700 mt-2">
              Disease: <strong>{predictionResult}</strong>
            </p>
          )}
          {inference && (
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold text-green-700">
                Inference 
              </h2>
              <p className="mt-2 text-gray-800">{inference}</p>
            </div>
          )}
        </div>
        {/* Transcription Section */}
        {transcript && (
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-green-700">
              Transcription
            </h2>
            <p className="mt-2 text-gray-800">{transcript}</p>
          </div>
        )}
        {/* Audio Recording Section */}
        {audioURL && (
          <div className="mt-6 bg-white p-4 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-green-700">
              Generated Audio
            </h2>
            <audio
              ref={audioRef}
              controls
              src={audioURL}
              className="w-full mt-2"
            />
          </div>
        )}

        {/* Microphone Section */}
        <div
          className={`bg-white rounded-3xl mt-auto mb-4 p-4 transition-all duration-300 ${
            isRecording ? "grid grid-cols-2 gap-2 items-center" : ""
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <>
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-800"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <div className="flex items-center justify-center h-12">
                <div className="flex items-center space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-green-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(
                          15,
                          Math.floor(Math.random() * 40)
                        )}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-800"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
