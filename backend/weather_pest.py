import requests
import os
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
WEATHER_API_KEY = os.getenv("OPEN_WEATHER_KEY")

# Define the city  
CITY_ID = "1274746"
API_URL = f"http://api.openweathermap.org/data/2.5/weather?id={CITY_ID}&appid={WEATHER_API_KEY}&units=metric"

# Fetch real-time weather data
def get_weather_data():
    response = requests.get(API_URL)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Analyze weather and check for pest alerts
def analyze_weather_conditions(weather_data):
    alerts = []

    # Extract relevant weather details
    temp = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    weather_condition = weather_data["weather"][0]["main"]
    wind_speed = weather_data["wind"]["speed"]

    # Weather alerts
    if temp > 35:
        alerts.append("⚠️ Heatwave alert! High temperatures can affect crops.")
    if humidity > 85:
        alerts.append("⚠️ High humidity detected! Risk of fungal infections on crops.")
    if "rain" in weather_condition.lower():
        alerts.append("🌧️ Heavy rainfall expected! Consider drainage precautions.")
    if wind_speed > 10:
        alerts.append("🌬️ Strong winds detected! Protect crops from wind damage.")

    # Pest outbreak conditions (Example rules)
    if humidity > 80 and temp > 25:
        alerts.append("🦗 High risk of locust infestation due to warm, humid conditions.")
    if "rain" in weather_condition.lower() and temp > 20:
        alerts.append("🦟 Increased mosquito population expected, be cautious of disease outbreaks.")

    return alerts
