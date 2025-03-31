import React from "react";

const Weather = () => {
  const weatherData = {
    temperature: 28,
    humidity: 65,
    condition: "Sunny",
    windSpeed: 12,
  };

  return (
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
        <span className="text-lg font-bold">{weatherData.temperature}°C</span>
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
        <span className="text-lg font-bold">{weatherData.windSpeed} km/h</span>
        <span className="text-xs text-gray-500">Wind Speed</span>
      </div>
    </div>
  );
};

export default Weather;
