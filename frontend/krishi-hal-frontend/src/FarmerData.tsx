import React, { useState } from "react";
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface Weather {
  humidity: string;
  temperature: string;
  other_conditions: string;
}

interface Treatment {
  pesticide: string;
  condition: string;
  weather: Weather;
}

interface Crop {
  name: string;
  health: {
    [period: string]: Treatment[];
  };
}

interface Farmer {
  land_size: number;
  farmer_name: string;
  crop: Crop;
}

interface FarmerData {
  farmers: {
    [id: string]: Farmer;
  };
}

const initialFarmerData: FarmerData = {
  farmers: {
    farmer_id: {
      land_size: 52,
      farmer_name: "Hari Gopal",
      crop: {
        name: "Wheat",
        health: {
          Week1: [
            {
              pesticide: "Azoxystrobin",
              condition:
                "Excellent soil conditions, plants showing robust growth with deep green foliage",
              weather: {
                humidity: "65%",
                temperature: "28°C",
                other_conditions: "Mostly sunny with occasional light showers",
              },
            },
          ],
          Week2: [
            {
              pesticide: "Propiconazole",
              condition:
                "Good soil moisture, some minor insect activity detected on leaf edges",
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
  const [farmerData, setFarmerData] = useState<FarmerData>(initialFarmerData);
  const [selectedPeriod, setSelectedPeriod] = useState("Week1");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [treatment, setTreatment] = useState<Treatment>({
    pesticide: "",
    condition: "",
    weather: {
      humidity: "",
      temperature: "",
      other_conditions: "",
    },
  });

  // Function to handle form submission and update local data
  const addTreatment = (farmerId: string) => {
    setFarmerData((prevData) => {
      const updatedData = { ...prevData };
      const farmer = updatedData.farmers[farmerId];

      if (farmer) {
        // Ensure Week3 exists, or create it
        if (!farmer.crop.health["Week3"]) {
          farmer.crop.health["Week3"] = [];
        }
        // Push the new treatment into Week3
        farmer.crop.health["Week3"] = [{ ...treatment }]; // Only store the latest entry
      }

      return updatedData;
    });

    // Reset form and hide it
    setIsFormVisible(false);
    setTreatment({
      pesticide: "",
      condition: "",
      weather: {
        humidity: "",
        temperature: "",
        other_conditions: "",
      },
    });

    // Ensure Week3 is selected after submission
    setSelectedPeriod("Week3");
  };

  return (
    <div
      className="relative max-w-sm mx-auto h-screen overflow-y-auto"
      style={{ background: "linear-gradient(to bottom, #91C4D0, #1C551C)" }}
    >
      <div className="relative w-full h-32">
        <img
          src="logo123.png"
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-4">
          Farmer Health Dashboard
        </h1>

        {Object.entries(farmerData.farmers).map(([farmerId, farmer]) => (
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

            {/* Health Records */}
            <div>
              <h4 className="font-semibold mb-2">Health Records:</h4>
              {farmer.crop.health[selectedPeriod]?.map((record, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <h5 className="font-semibold">
                      {selectedPeriod.replace(/_/g, " ")}
                    </h5>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                      <div>
                        <p className="font-medium">Pesticide:</p>
                        <p className="text-gray-700">{record.pesticide}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Sun className="h-5 w-5 text-green-600 mt-1 mr-2" />
                      <div>
                        <p className="font-medium">Condition:</p>
                        <p className="text-gray-700">{record.condition}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-2">Weather:</p>
                      <p className="text-gray-700">
                        <span className="font-medium">Temperature:</span>{" "}
                        {record.weather.temperature}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Humidity:</span>{" "}
                        {record.weather.humidity}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Other Conditions:</span>{" "}
                        {record.weather.other_conditions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
              >
                Add Treatment
              </button>
            </div>
          </div>
        ))}

        {/* Treatment Form */}
        {isFormVisible && (
          <div className="bg-white p-4 rounded-md shadow-md mt-4">
            <h3 className="text-lg font-semibold mb-2">New Treatment</h3>
            {[
              "pesticide",
              "condition",
              "humidity",
              "temperature",
              "other_conditions",
            ].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.replace("_", " ")}
                value={treatment[field as keyof Treatment] as string}
                onChange={(e) =>
                  setTreatment({
                    ...treatment,
                    [field]: e.target.value,
                  })
                }
                className="border p-2 w-full rounded mb-2"
              />
            ))}
            <button
              onClick={() => addTreatment("farmer_id")}
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
