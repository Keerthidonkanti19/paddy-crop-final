from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "ml-api" / "model" / "paddy_model.keras"
CLASS_PATH = BASE_DIR / "ml-api" / "model" / "class_indices.json"


# ============================================================
# LOAD MODEL
# ============================================================

model = load_model(MODEL_PATH)


# ============================================================
# LOAD CLASS LABELS
# ============================================================

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    class_indices = json.load(f)

# Convert JSON keys from strings to integers
class_indices = {
    int(k): v
    for k, v in class_indices.items()
}


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_disease_from_path(
    file_path: str,
) -> dict[str, Any]:

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    image = Image.open(file_path).convert("RGB")

    # --------------------------------------------------------
    # Resize image
    # --------------------------------------------------------

    image = image.resize((224, 224))

    # --------------------------------------------------------
    # Convert to NumPy
    # --------------------------------------------------------

    image = np.array(image, dtype=np.float32)

    # --------------------------------------------------------
    # Add batch dimension
    # --------------------------------------------------------

    image = np.expand_dims(image, axis=0)

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # DO NOT call preprocess_input() here.
    #
    # The trained paddy_model.keras already performs:
    #
    #     preprocess_input(x)
    #
    # internally.
    #
    # Therefore the backend sends the normal 0-255
    # image directly to the model.
    # --------------------------------------------------------

    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    predictions = model(
        image,
        training=False,
    ).numpy()[0]

    # --------------------------------------------------------
    # Debugging
    # --------------------------------------------------------

    print("\n===== Prediction Probabilities =====")

    probabilities = {}

    for idx, prob in enumerate(predictions):

        label = class_indices[idx]

        prob_percent = round(
            float(prob) * 100,
            2,
        )

        probabilities[label] = prob_percent

        print(
            f"{label}: {prob_percent}%"
        )

    # --------------------------------------------------------
    # Best prediction
    # --------------------------------------------------------

    predicted_index = int(
        np.argmax(predictions)
    )

    predicted_label = class_indices[
        predicted_index
    ]

    confidence = round(
        float(np.max(predictions)) * 100,
        2,
    )

    print(
        "\nFinal Prediction:",
        predicted_label,
    )

    print(
        "Confidence:",
        confidence,
    )

    # --------------------------------------------------------
    # Confidence threshold
    # --------------------------------------------------------

    if confidence < 70:

        return {
            "success": True,
            "prediction": predicted_label,
            "confidence": confidence,
            "warning": "Low confidence prediction",
            "probabilities": probabilities,
        }

    return {
        "success": True,
        "prediction": predicted_label,
        "confidence": confidence,
        "probabilities": probabilities,
    }