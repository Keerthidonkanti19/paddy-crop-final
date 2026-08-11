
import os
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# =========================
# LOAD MODEL
# =========================
MODEL_PATH = "model/paddy_model.keras"
CLASS_INDEX_PATH = "model/class_indices.json"

model = load_model(MODEL_PATH)

# =========================
# LOAD CLASS LABELS
# =========================
# with open(CLASS_INDEX_PATH, "r") as f:
#     class_indices = json.load(f)

# # Reverse dictionary
# class_labels = {v: k for k, v in class_indices.items()}
with open(CLASS_INDEX_PATH, "r") as f:
    class_labels = json.load(f)

# =========================
# IMAGE FOLDER
# =========================
TEST_FOLDER = "sample_images"

# =========================
# PREDICT EACH IMAGE
# =========================
for filename in os.listdir(TEST_FOLDER):

    image_path = os.path.join(TEST_FOLDER, filename)

    try:
        # Load image
        img = image.load_img(image_path, target_size=(224, 224))

        # Convert to array
        img_array = image.img_to_array(img)

        # Expand dimensions
        img_array = np.expand_dims(img_array, axis=0)

        # Normalize
        # img_array = img_array / 255.0

        # MobileNetV2 preprocessing
        img_array = preprocess_input(img_array)

        # Prediction
        predictions = model.predict(img_array, verbose=0)

        # predicted_class = np.argmax(predictions)

        # confidence = np.max(predictions) * 100

        # # disease_name = class_labels[predicted_class]
        # disease_name = class_labels[str(predicted_class)]

        # print("\n========================")
        # print(f"Image      : {filename}")
        # print(f"Prediction : {disease_name}")
        # print(f"Confidence : {confidence:.2f}%")
        # print("========================")

        predicted_class = np.argmax(predictions)

        confidence = np.max(predictions) * 100

        disease_name = class_labels[str(predicted_class)]

        print("\n========================")
        print(f"Image      : {filename}")
        print(f"Prediction : {disease_name}")
        print(f"Confidence : {confidence:.2f}%")

        print("\nAll Class Probabilities:")

        for idx, prob in enumerate(predictions[0]):

            label = class_labels[str(idx)]

            print(f"{label:<20}: {prob * 100:.2f}%")

        print("========================")

    except Exception as e:
        print(f"Error processing {filename}: {e}")