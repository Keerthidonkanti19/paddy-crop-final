# train_paddy_model.py
import argparse
import json
import logging
from pathlib import Path
from typing import Tuple

import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# -----------------------------
# Configuration & logging
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("paddy-train")

SEED = 42
tf.keras.utils.set_random_seed(SEED)


# -----------------------------
# Data pipeline
# -----------------------------
def load_datasets(
    dataset_dir: Path,
    img_size: Tuple[int, int] = (224, 224),
    batch_size: int = 32,
):

    train_dir = dataset_dir / "train"
    test_dir = dataset_dir / "test"

    if not train_dir.exists() or not test_dir.exists():
        raise FileNotFoundError(
            f"Expected 'train' and 'test' directories inside {dataset_dir}"
        )

    logger.info("Loading training data from %s", train_dir)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        seed=SEED,
        image_size=img_size,
        batch_size=batch_size,
    )

    logger.info("Loading validation data from %s", test_dir)

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="categorical",
        seed=SEED,
        image_size=img_size,
        batch_size=batch_size,
    )

    class_names = train_ds.class_names
    class_indices = {name: idx for idx, name in enumerate(class_names)}

    logger.info("Detected classes: %s", class_indices)

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = train_ds.shuffle(1000).prefetch(AUTOTUNE)
    test_ds = test_ds.prefetch(AUTOTUNE)

    return train_ds, test_ds, class_indices


# -----------------------------
# Model definition
# -----------------------------
def build_model(num_classes: int, img_size=(224, 224)):

    inputs = layers.Input(shape=(img_size[0], img_size[1], 3))

    # Stronger augmentation
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.3),
        layers.RandomZoom(0.3),
        layers.RandomContrast(0.3),
        layers.RandomTranslation(0.1, 0.1),
    ])

    x = data_augmentation(inputs)

    # MobileNet preprocessing
    x = preprocess_input(x)

    base_model = MobileNetV2(
        input_shape=(img_size[0], img_size[1], 3),
        include_top=False,
        weights="imagenet",
    )

    # Phase 1 training
    base_model.trainable = False

    x = base_model(x, training=False)

    x = layers.GlobalAveragePooling2D()(x)

    x = layers.BatchNormalization()(x)

    x = layers.Dense(128, activation="relu")(x)

    x = layers.Dropout(0.4)(x)

    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    model.summary()

    return model, base_model


# -----------------------------
# Training
# -----------------------------
def train_model(model, base_model, train_ds, test_ds, epochs, output_dir):

    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "paddy_model.h5"

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=7,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            verbose=1,
        ),
    ]

    logger.info("Phase 1 Training (Frozen MobileNet)")

    history = model.fit(
        train_ds,
        validation_data=test_ds,
        epochs=15,
        callbacks=callbacks,
    )

    # -----------------------------
    # Phase 2 Fine Tuning
    # -----------------------------
    logger.info("Phase 2 Fine-tuning MobileNet")

    base_model.trainable = True

    for layer in base_model.layers[:-60]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history_fine = model.fit(
        train_ds,
        validation_data=test_ds,
        epochs=epochs,
        callbacks=callbacks,
    )

    return history_fine


# -----------------------------
# Plotting
# -----------------------------
def plot_training_history(history, output_dir):

    acc = history.history["accuracy"]
    val_acc = history.history["val_accuracy"]

    loss = history.history["loss"]
    val_loss = history.history["val_loss"]

    epochs_range = range(1, len(acc) + 1)

    plt.figure()
    plt.plot(epochs_range, acc, label="Training Accuracy")
    plt.plot(epochs_range, val_acc, label="Validation Accuracy")
    plt.legend()
    plt.title("Accuracy")
    plt.savefig(output_dir / "accuracy.png")
    plt.close()

    plt.figure()
    plt.plot(epochs_range, loss, label="Training Loss")
    plt.plot(epochs_range, val_loss, label="Validation Loss")
    plt.legend()
    plt.title("Loss")
    plt.savefig(output_dir / "loss.png")
    plt.close()


# -----------------------------
# Main
# -----------------------------
def main():

    parser = argparse.ArgumentParser()

    parser.add_argument("--dataset_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, default="model")
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch_size", type=int, default=32)

    args = parser.parse_args()

    dataset_dir = Path(args.dataset_dir)
    output_dir = Path(args.output_dir)

    train_ds, test_ds, class_indices = load_datasets(
        dataset_dir=dataset_dir,
        batch_size=args.batch_size,
    )

    model, base_model = build_model(num_classes=len(class_indices))

    history = train_model(
        model,
        base_model,
        train_ds,
        test_ds,
        args.epochs,
        output_dir,
    )

    model.save(output_dir / "paddy_model.h5")

    with open(output_dir / "class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=2)

    plot_training_history(history, output_dir)

    print("Training completed successfully.")


if __name__ == "__main__":
    main()