"use client";

import { useState } from "react";
import leafimage from "../public/images/placeholder2.svg";
import logo from "../public/images/logo123.png";
export default function KrishiHalApp() {
  const [isRecording, setIsRecording] = useState(false);

  // Sample weather data - this would come from your API in a real app
  const weatherData = {
    temperature: 28,
    humidity: 65,
    condition: "Sunny",
    windSpeed: 12,
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div
      className="relative max-w-sm mx-auto h-screen overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #91C4D0, #1C551C)" }}
    >
      {/* Top banner with Krishi-Hal text */}
      <div className="relative w-full h-32">
        <img
          src={logo}
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center"></div>
      </div>

      {/* Main content area */}
      <div className="h-[calc(100%-128px)] p-4 flex flex-col gap-4">
        {/* Weather Dashboard */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {/* Temperature Card */}
          <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-red-500 mb-1"
            >
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
            </svg>
            <span className="text-lg font-bold">
              {weatherData.temperature}°C
            </span>
            <span className="text-xs text-gray-500">Temperature</span>
          </div>

          {/* Humidity Card */}
          <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-blue-500 mb-1"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="text-lg font-bold">{weatherData.humidity}%</span>
            <span className="text-xs text-gray-500">Humidity</span>
          </div>

          {/* Weather Condition Card */}
          <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-yellow-500 mb-1"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span className="text-lg font-bold">{weatherData.condition}</span>
            <span className="text-xs text-gray-500">Condition</span>
          </div>

          {/* Wind Speed Card */}
          <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-500 mb-1"
            >
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
              <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
              <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
            </svg>
            <span className="text-lg font-bold">
              {weatherData.windSpeed} km/h
            </span>
            <span className="text-xs text-gray-500">Wind Speed</span>
          </div>
        </div>

        {/* Leaf image card */}
        <div className="bg-white rounded-3xl p-3 shadow-md">
          <div className="rounded-3xl overflow-hidden">
            <img
              src={leafimage}
              alt="Leaf image"
              className="w-full aspect-square object-cover"
            />
          </div>
          <div className="flex items-center justify-between mt-4 px-2 pb-2 text-gray-600">
            <span className="text-xl">Click to Import Image</span>
            <div className="w-10 h-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                <path d="M8 21 L6 21 L6 19" />
                <path d="m14 15 3 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Microphone section */}
        <div
          className={`bg-white rounded-3xl mt-auto mb-4 p-4 transition-all duration-300 ${
            isRecording ? "grid grid-cols-2 gap-2 items-center" : ""
          }`}
          onClick={toggleRecording}
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
