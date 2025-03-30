# API Endpoints Documentation

This document provides an overview of the available API endpoints, including their HTTP methods, accepted input data, and expected responses.

## 1. Plant Disease Prediction Endpoint

**Endpoint:** `/predict/`

**Method:** `POST`

**Description:** Accepts a base64-encoded image of a plant and returns a prediction of the plant disease.

**Request Body:**

- `image_base64` (string): The base64-encoded string representing the image of the plant.

**Response:**

- `200 OK`: Returns a JSON object containing:
  - `predicted_class` (string): The name of the predicted disease.
  - `confidence` (float): The confidence score of the prediction.

**Example Request:**

```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUg..."
}
```

**Example Response:**

```json
{
  "predicted_class": "Powdery Mildew",
  "confidence": 0.95
}
```

## 2. Real-Time Weather Data Endpoint

**Endpoint:** `/weather/{city_id}`

**Method:** `GET`

**Description:** Fetches real-time weather data for the specified city.

**Path Parameter:**

- `city_id` (string): The unique identifier for the city (e.g., "1274746" for a specific city).

**Response:**

- `200 OK`: Returns a JSON object containing weather data from the OpenWeatherMap API.

**Example Response:**

```json
{
  "coord": { "lon": 77.2167, "lat": 28.6667 },
  "weather": [
    {
      "id": 721,
      "main": "Haze",
      "description": "haze",
      "icon": "50d"
    }
  ],
  "main": {
    "temp": 30,
    "feels_like": 33,
    "temp_min": 30,
    "temp_max": 30,
    "pressure": 1010,
    "humidity": 70
  },
  "wind": { "speed": 3.6, "deg": 140 },
  "clouds": { "all": 40 },
  "dt": 1618317040,
  "sys": {
    "type": 1,
    "id": 9165,
    "country": "IN",
    "sunrise": 1618282134,
    "sunset": 1618327412
  },
  "timezone": 19800,
  "id": 1274746,
  "name": "City Name",
  "cod": 200
}
```

## 3. Weather Alerts and Pest Analysis Endpoint

**Endpoint:** `/weather/alerts/{city_id}`

**Method:** `GET`

**Description:** Fetches weather data for the specified city and analyzes it to generate potential weather and pest alerts.

**Path Parameter:**

- `city_id` (string): The unique identifier for the city.

**Response:**

- `200 OK`: Returns a JSON object containing:
  - `alerts` (array of strings): A list of alerts based on the current weather conditions.

**Example Response:**

```json
{
  "alerts": [
    "⚠️ High humidity detected! Risk of fungal infections on crops.",
    "🦗 High risk of locust infestation due to warm, humid conditions."
  ]
}
```

**Note:** Ensure that the `city_id` provided corresponds to a valid city in the OpenWeatherMap database. 