import os
import base64
import numpy as np
from PIL import Image
import tensorflow as tf
import io

# Define paths to the model and labels
MODEL_PATH = 'model/MobileNetV2.tfliteQuant'
LABELS_PATH = 'model/Labels.txt'

def load_labels():
    """Load the labels from the labels file."""
    with open(LABELS_PATH, 'r') as file:
        labels = [line.strip() for line in file.readlines()]
    return labels

def load_model():
    """Load the TFLite model."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please ensure the model is in the directory.")
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    return interpreter

def preprocess_image(image_base64):
    """Decode a base64-encoded image and preprocess it for model prediction."""
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)
    image_array /= 255.0  # Normalize to [0, 1]
    return image_array

def infer(image_base64, interpreter, labels):
    """Perform inference on a base64-encoded image and return predictions."""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_data = preprocess_image(image_base64)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    predicted_index = np.argmax(output_data[0])
    predicted_label = labels[predicted_index]
    confidence = float(output_data[0][predicted_index])
    result = {
        'predicted_class': predicted_label,
        'confidence': confidence
    }
    return result
