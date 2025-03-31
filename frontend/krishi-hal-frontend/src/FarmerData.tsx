import React from "react";
import { useState } from "react";
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Sample data with realistic values
const weatherData = {
  temperature: 28,
  humidity: 65,
  condition: "Sunny",
  windSpeed: 12,
};

const farmerData = {
  farmers: {
    farmer_id: {
      land_size: 52,
      farmer_name: "Hari Gopal",
      crop: {
        name: "Wheat",
        health: {
          month_or_week_1: [
            "Azoxystrobin",
            "Excellent soil conditions, plants showing robust growth with deep green foliage",
            {
              weather: {
                humidity: "65%",
                temperature: "28°C",
                other_conditions: "Mostly sunny with occasional light showers",
              },
            },
          ],
          month_or_week_2: [
            "Propiconazole",
            "Good soil moisture, some minor insect activity detected on leaf edges",
            {
              weather: {
                humidity: "70%",
                temperature: "32°C",
                other_conditions: "Higher than average rainfall",
              },
            },
          ],
        },
      },
    },
  },
};

export default function FarmerHealthPage() {
  const farmers = farmerData.farmers;
  const [selectedPeriod, setSelectedPeriod] = useState("month_or_week_1");
  const [treatment, setTreatment] = useState({
    pesticide: "",
    condition: "",
    weather: {
      humidity: "",
      temperature: "",
      other_conditions: "",
    },
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const addTreatment = async (farmerId: Number) => {
    try {
      const response = await fetch(
        `http://your-api.com/farmers/${farmerId}/treatments/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(treatment),
        }
      );

      if (response.ok) {
        alert("Treatment added successfully!");
        setIsFormVisible(false);
      } else {
        alert("Error adding treatment");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className="relative max-w-sm mx-auto h-screen overflow-y-auto"
      style={{ background: "linear-gradient(to bottom, #91C4D0, #1C551C)" }}
    >
      {/* Top Banner */}
      <div className="relative w-full h-32">
        <img
          src="logo123.png"
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4">
        {/* Weather Information */}
        <div className="bg-white rounded-3xl p-4 shadow-md mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Sun className="h-6 w-6 text-yellow-500 mr-2" />
            <span className="font-semibold">{weatherData.condition}</span>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Thermometer className="h-5 w-5 text-red-500 mr-1" />
              <span>{weatherData.temperature}°C</span>
            </div>
            <div className="flex items-center">
              <Droplets className="h-5 w-5 text-blue-500 mr-1" />
              <span>{weatherData.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind className="h-5 w-5 text-gray-500 mr-1" />
              <span>{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Farmer Health Dashboard
        </h1>

        {Object.entries(farmers).map(([farmerId, farmer]) => (
          <div
            key={farmerId}
            className="bg-white rounded-3xl p-6 shadow-md mb-6"
          >
            <h2 className="text-xl font-semibold mb-2">
              Farmer: {farmer.farmer_name}
            </h2>
            <p className="mb-2">Land Size: {farmer.land_size} acres</p>
            <h3 className="text-lg font-semibold mb-2">
              Crop: {farmer.crop.name}
            </h3>

            {/* Period Selection */}
            <div className="flex space-x-2 mb-4">
              {Object.keys(farmer.crop.health).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedPeriod === period
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {period.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Health Records:</h4>
              {Object.entries(farmer.crop.health).map(([period, details]) => {
                // Only show the selected period
                if (period !== selectedPeriod) return null;

                // Destructure the details array with proper type assertion.
                const [pesticide, condition, weatherData] = details as [
                  string,
                  string,
                  {
                    weather: {
                      humidity: string;
                      temperature: string;
                      other_conditions: string;
                    };
                  }
                ];
                return (
                  <div
                    key={period}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center mb-3">
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
                      <h5 className="font-semibold">
                        {period.replace(/_/g, " ")}
                      </h5>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                        <div>
                          <p className="font-medium">Pesticide:</p>
                          <p className="text-gray-700">{pesticide}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Sun className="h-5 w-5 text-green-600 mt-1 mr-2" />
                        <div>
                          <p className="font-medium">Condition:</p>
                          <p className="text-gray-700">{condition}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Weather:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                            <p className="text-gray-700">
                              <span className="font-medium">Temperature:</span>{" "}
                              {weatherData.weather.temperature}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                            <p className="text-gray-700">
                              <span className="font-medium">Humidity:</span>{" "}
                              {weatherData.weather.humidity}
                            </p>
                          </div>
                          <div className="flex items-center col-span-2">
                            <Wind className="h-4 w-4 text-gray-500 mr-2" />
                            <p className="text-gray-700">
                              <span className="font-medium">
                                Other Conditions:
                              </span>{" "}
                              {weatherData.weather.other_conditions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
              >
                Add Treatment
              </button>
            </div>
          </div>
        ))}
        {isFormVisible && (
          <div className="bg-white p-4 rounded-md shadow-md mt-4">
            <h3 className="text-lg font-semibold mb-2">New Treatment</h3>
            <input
              type="text"
              placeholder="Pesticide Name"
              value={treatment.pesticide}
              onChange={(e) =>
                setTreatment({ ...treatment, pesticide: e.target.value })
              }
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              placeholder="Condition"
              value={treatment.condition}
              onChange={(e) =>
                setTreatment({ ...treatment, condition: e.target.value })
              }
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              placeholder="Humidity"
              value={treatment.weather.humidity}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  weather: { ...treatment.weather, humidity: e.target.value },
                })
              }
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              placeholder="Temperature"
              value={treatment.weather.temperature}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  weather: {
                    ...treatment.weather,
                    temperature: e.target.value,
                  },
                })
              }
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              placeholder="Other Conditions"
              value={treatment.weather.other_conditions}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  weather: {
                    ...treatment.weather,
                    other_conditions: e.target.value,
                  },
                })
              }
              className="border p-2 w-full rounded mb-2"
            />
            <button
              onClick={() => addTreatment(farmerId)}
              className="bg-green-600 text-white px-4 py-2 rounded-md mt-2"
            >
              Submit Treatment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
