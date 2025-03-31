import os
from pathlib import Path
import numpy as np
import soundfile as sf
import base64
import tempfile
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body
from loguru import logger
from sarvam_transc import transcribe, translate
from chat_res import chat
from TTS import speak
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sarvam_transc import transcribe, translate
from predict_disease import load_model, load_labels, infer
from weather_pest import get_weather_data, analyze_weather_conditions
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date as _date
from pydantic import Field
import json
from TTS import speak
from literation import transliteration

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


audio_buffer = []


class ImagePayload(BaseModel):
    base64_image: str  # Buffer to accumulate audio chunks


class Treatment(BaseModel):
    date: _date = Field(..., example="2025-03-30")
    treatment: str = Field(..., example="Pesticide A")
    crop: str = Field(..., example="Wheat")


class Farmer(BaseModel):
    farmer_id: str = Field(..., example="1")
    name: str = Field(..., example="John Doe")
    treatment_history: List[Treatment] = []


DATA_FILE = "farmers_data.json"


def load_data():
    if not os.path.exists(DATA_FILE):
        return {"farmers": []}
    with open(DATA_FILE, "r") as file:
        return json.load(file)


def save_data(data):
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)


transcription_results = []  # Accumulate transcription results
communication_history = []


interpreter = load_model()
labels = load_labels()


class ImageData(BaseModel):
    image_base64: str


interpreter = load_model()
labels = load_labels()


class ImageData(BaseModel):
    image_base64: str


@app.websocket("/ws/transcription")
async def websocket_transcription(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connected")
    
    transcription_results = []

    try:
        while True:
            try:
                # Set a timeout for receiving the next chunk
                data = await websocket.receive_text()
                
                # Check if this is an end-of-transmission signal
                if data == "END_OF_TRANSMISSION":
                    logger.info("Received end of transmission signal")
                    break

                logger.info(f"Received audio chunk: {len(data)} bytes")

                if data:
                    try:
                        # Decode Base64 to bytes
                        audio_bytes = base64.b64decode(data)
                        int16_array = np.frombuffer(audio_bytes, dtype=np.int16)
                        temp_file_path = save_chunk_to_temp_file(int16_array)
                        if temp_file_path:
                            transcription = transcribe(temp_file_path)
                            transcription_results.append(transcription)
                            logger.success(f"Transcribed chunk: {transcription}")

                    except Exception as e:
                        logger.error(f"Error processing chunk: {e}")
                        continue
                
            except WebSocketDisconnect:
                logger.warning("Client disconnected. Processing final transcription.")
                break
            except Exception as e:
                logger.error(f"Unexpected error in chunk processing: {e}")
                continue
        
        # Only reach this point if we broke out of the loop
        logger.info("Processing final transcription")
        final_transcription = " ".join(transcription_results)
        logger.success(f"Final transcription: {final_transcription}")
        
        chat_response = chat(str(final_transcription), communication_history)
        logger.success(f"Chat response: {chat_response}")
        translation = translate(chat_response)

        #message sent in hindi script
        await websocket.send_text(transliteration(translation))
        logger.success(translation)

        #sending hindi audio chunks to hte frontend
        for audio_data in speak(translation):
            logger.info("audio data is here")
            if audio_data:
                await websocket.send_text(audio_data)
                logger.success("Sent translated speech to frontend")
        
        transcription_results.clear()

    except Exception as e:
        logger.error(f"Unexpected error in websocket: {e}")
    finally:
        await websocket.close()

@app.post("/upload-image/")
async def upload_image(payload: ImagePayload):
    """Receives a Base64 image, decodes, saves it temporarily, and runs inference."""
    try:
        # Decode Base64 image
        image_data = base64.b64decode(payload.base64_image)

        # Create a temporary image file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_file_path = temp_file.name
        temp_file.write(image_data)
        temp_file.close()

        logger.success(f"Image saved temporarily at: {temp_file_path}")

        # Run inference on the uploaded image
        try:
            prediction = infer(payload.base64_image, interpreter, labels)
            logger.success(f"Inference result: {prediction}")
        except Exception as e:
            logger.error(f"Error during inference: {e}")
            raise HTTPException(status_code=500, detail="Inference failed")

        return {
            "message": "Image uploaded and processed successfully",
            "file_path": temp_file_path,
            "prediction": prediction,
        }

    except base64.binascii.Error as e:
        logger.error(f"Base64 decoding error: {e}")
        raise HTTPException(status_code=400, detail="Invalid Base64 data")
    except Exception as e:
        logger.error(f"Error saving image: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def save_chunk_to_temp_file(audio_chunk):
    """Saves an audio chunk as a temporary WAV file."""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")

        temp_file_path = temp_file.name
        temp_file.close()

        # Save using soundfile (16-bit PCM WAV, mono, 16kHz)
        sf.write(temp_file_path, audio_chunk, samplerate=16000, subtype="PCM_16")
        logger.success(f"Chunk saved temporarily at: {temp_file_path}")
        return temp_file_path

    except Exception as e:
        logger.error(f"Error saving temp audio file: {e}")
        return None


@app.post("/predict/")
async def predict(image_data: ImageData):
    try:
        prediction = infer(image_data.image_base64, interpreter, labels)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather/{city_id}")
async def weather(city_id: str):
    try:
        weather_data = get_weather_data(city_id)
        return weather_data
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather/alerts/{city_id}")
async def weather_alerts(city_id: str):
    try:
        weather_data = get_weather_data(city_id)
        alerts = analyze_weather_conditions(weather_data)
        return {"alerts": alerts}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/farmers/", status_code=201)
async def add_farmer(farmer: Farmer):
    data = load_data()
    if any(f["farmer_id"] == farmer.farmer_id for f in data["farmers"]):
        raise HTTPException(
            status_code=400, detail="Farmer with this ID already exists."
        )
    data["farmers"].append(farmer.dict())
    save_data(data)
    return {"message": "Farmer added successfully."}


@app.post("/farmers/{farmer_id}/treatments/", status_code=201)
async def add_treatment(farmer_id: str, treatment: Treatment = Body(...)):
    data = load_data()
    for farmer in data["farmers"]:
        if farmer["farmer_id"] == farmer_id:
            farmer["treatment_history"].append(treatment.dict())
            save_data(data)
            return {"message": "Treatment added successfully."}
    raise HTTPException(status_code=404, detail="Farmer not found.")


@app.get("/farmers/{farmer_id}/treatments/", response_model=List[Treatment])
async def get_treatment_history(farmer_id: str):
    data = load_data()
    for farmer in data["farmers"]:
        if farmer["farmer_id"] == farmer_id:
            return farmer["treatment_history"]
    raise HTTPException(status_code=404, detail="Farmer not found.")


# @app.get("/plant_disease")
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8005)
