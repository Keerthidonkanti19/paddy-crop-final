import sys
import os
import random
from pathlib import Path

sys.path.append(os.path.abspath(".."))

from backend.app.ml_model import predict_disease_from_path

test_folder = r"D:\paddy crop disease dataset - Copy\Ultimate Crop Disease Dataet\test"

images = list(Path(test_folder).rglob("*.jpg"))
sample_images = random.sample(images, 20)

for img in sample_images:
    result = predict_disease_from_path(str(img))

    print(f"\nImage: {img.name}")
    print("Prediction:", result["label"])
    print("Confidence:", result["confidence"])