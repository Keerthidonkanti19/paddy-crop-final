# ml_model.py
from typing import Dict
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras import layers, models
import json
from pathlib import Path


# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "ml-api" / "model" / "paddy_model.h5"
CLASS_PATH = BASE_DIR / "ml-api" / "model" / "class_indices.json"


# -----------------------------
# Load class mapping
# -----------------------------
with open(CLASS_PATH) as f:
    class_indices = json.load(f)

idx_to_class = {v: k for k, v in class_indices.items()}
NUM_CLASSES = len(class_indices)


# -----------------------------
# Build model architecture
# Must match training model
# -----------------------------
inputs = layers.Input(shape=(224, 224, 3))

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = True

# Freeze first layers (fine-tuning setup)
for layer in base_model.layers[:-40]:
    layer.trainable = False


x = base_model(inputs, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.BatchNormalization()(x)

x = layers.Dense(128, activation="relu")(x)

x = layers.Dropout(0.4)(x)

outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = models.Model(inputs, outputs)


# -----------------------------
# Load trained weights
# -----------------------------
model.load_weights(MODEL_PATH)


# -----------------------------
# Prediction with TTA
# -----------------------------
def predict_disease_from_path(file_path: str) -> Dict:

    img = image.load_img(file_path, target_size=(224, 224))
    img_array = image.img_to_array(img)

    # Create augmented versions for TTA
    # flipped = tf.image.flip_left_right(img_array)
    # bright = tf.image.adjust_brightness(img_array, 0.1)
    # rotated = tf.image.rot90(img_array)
    flipped = tf.image.flip_left_right(img_array)
    flipped_ud = tf.image.flip_up_down(img_array)
    bright = tf.image.adjust_brightness(img_array, 0.2)
    rotated = tf.image.rot90(img_array)
    rotated2 = tf.image.rot90(img_array, k=2)

    images = [img_array, flipped, flipped_ud, bright, rotated, rotated2]
    # images = [img_array, flipped, bright, rotated]

    predictions = []

    for img_aug in images:

        img_aug = np.expand_dims(img_aug, axis=0)

        img_aug = preprocess_input(img_aug)

        preds = model.predict(img_aug, verbose=0)

        predictions.append(preds[0])

    # Average predictions
    avg_pred = np.mean(predictions, axis=0)

    predicted_index = int(np.argmax(avg_pred))
    confidence = float(np.max(avg_pred))

    label = idx_to_class[predicted_index]

    # Confidence threshold
    if confidence < 0.70:
        label = "Uncertain / unclear leaf image"

    return {
        "label": label,
        "confidence": round(confidence, 4)
    }