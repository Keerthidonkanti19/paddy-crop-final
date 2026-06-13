import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# -----------------------------
# Configuration
# -----------------------------
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# New dataset path
dataset_dir = "data/test"

# -----------------------------
# Load Test Dataset
# -----------------------------
test_ds = tf.keras.utils.image_dataset_from_directory(
    dataset_dir,
    labels="inferred",
    label_mode="categorical",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
)

class_names = test_ds.class_names

print("\nDetected Classes:")
for idx, name in enumerate(class_names):
    print(f"{idx}: {name}")

# -----------------------------
# Preprocessing
# -----------------------------
def preprocess(image, label):
    image = preprocess_input(image)
    return image, label

AUTOTUNE = tf.data.AUTOTUNE

test_ds = test_ds.map(preprocess).prefetch(AUTOTUNE)

# -----------------------------
# Load Trained Model
# -----------------------------
model = load_model("model/paddy_model.keras")

# -----------------------------
# Evaluate Model
# -----------------------------
print("\nEvaluating model on unseen test dataset...\n")

loss, accuracy = model.evaluate(test_ds)

print("\n==============================")
print(f"Test Accuracy : {accuracy:.4f}")
print(f"Test Loss     : {loss:.4f}")
print("==============================")