import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

dataset_dir = r"D:\paddy crop disease dataset - Copy\Ultimate Crop Disease Dataet\test"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# Load dataset
test_ds = tf.keras.utils.image_dataset_from_directory(
    dataset_dir,
    labels="inferred",
    label_mode="categorical",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
)

NUM_CLASSES = len(test_ds.class_names)

def preprocess(image, label):
    image = preprocess_input(image)
    return image, label

test_ds = test_ds.map(preprocess)

# Rebuild the same architecture used in training
inputs = layers.Input(shape=(224, 224, 3))

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = True

for layer in base_model.layers[:-30]:
    layer.trainable = False

x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = models.Model(inputs, outputs)

# Load weights from trained model
model.load_weights("model/paddy_model.h5")

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

loss, accuracy = model.evaluate(test_ds)

print("Validation Accuracy:", accuracy)
print("Validation Loss:", loss)