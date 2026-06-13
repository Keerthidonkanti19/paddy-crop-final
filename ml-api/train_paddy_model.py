# train_paddy_model.py

import argparse
import json
import logging
from pathlib import Path
from typing import Tuple

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf

from sklearn.utils.class_weight import compute_class_weight

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
    val_dir = dataset_dir / "val"
    test_dir = dataset_dir / "test"

    if (
        not train_dir.exists()
        or not val_dir.exists()
        or not test_dir.exists()
    ):
        raise FileNotFoundError(
            f"Expected train, val, and test directories inside {dataset_dir}"
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

    logger.info("Loading validation data from %s", val_dir)

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        seed=SEED,
        image_size=img_size,
        batch_size=batch_size,
    )

    logger.info("Loading test data from %s", test_dir)

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="categorical",
        seed=SEED,
        image_size=img_size,
        batch_size=batch_size,
        shuffle=False,
    )

    class_names = train_ds.class_names

    # index -> class name mapping
    class_indices = {
        idx: name for idx, name in enumerate(class_names)
    }

    logger.info("Detected classes: %s", class_indices)

    # -----------------------------
    # Compute class weights
    # -----------------------------
    train_labels = []

    for _, labels in train_ds.unbatch():
        train_labels.append(tf.argmax(labels).numpy())

    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(train_labels),
        y=train_labels,
    )

    class_weights = {
        i: weight for i, weight in enumerate(class_weights)
    }

    logger.info("Class Weights: %s", class_weights)

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = train_ds.shuffle(1000).prefetch(AUTOTUNE)
    val_ds = val_ds.prefetch(AUTOTUNE)
    test_ds = test_ds.prefetch(AUTOTUNE)

    return (
        train_ds,
        val_ds,
        test_ds,
        class_indices,
        class_weights,
    )


# -----------------------------
# Model definition
# -----------------------------
def build_model(num_classes: int, img_size=(224, 224)):

    inputs = layers.Input(shape=(img_size[0], img_size[1], 3))

    # Lightweight augmentation
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.05),
        layers.RandomZoom(0.05),
    ])

    x = data_augmentation(inputs)

    # MobileNetV2 preprocessing
    x = preprocess_input(x)

    base_model = MobileNetV2(
        input_shape=(img_size[0], img_size[1], 3),
        include_top=False,
        weights="imagenet",
    )

    # Freeze base model initially
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
def train_model(
    model,
    base_model,
    train_ds,
    val_ds,
    epochs,
    output_dir,
    class_weights,
):

    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "paddy_model.keras"

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

    # -----------------------------
    # Phase 1 Training
    # -----------------------------
    logger.info("Phase 1 Training (Frozen MobileNetV2)")

    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        callbacks=callbacks,
        class_weight=class_weights,
    )

    return history_phase1, None


# -----------------------------
# Evaluation
# -----------------------------
def evaluate_model(model, test_ds):

    logger.info("Evaluating model on unseen test data")

    test_loss, test_accuracy = model.evaluate(test_ds)

    print("\n==============================")
    print(f"Test Accuracy : {test_accuracy:.4f}")
    print(f"Test Loss     : {test_loss:.4f}")
    print("==============================\n")


# -----------------------------
# Plotting
# -----------------------------
def plot_training_history(history, output_dir, phase_name):

    acc = history.history["accuracy"]
    val_acc = history.history["val_accuracy"]

    loss = history.history["loss"]
    val_loss = history.history["val_loss"]

    epochs_range = range(1, len(acc) + 1)

    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, acc, label="Training Accuracy")
    plt.plot(epochs_range, val_acc, label="Validation Accuracy")
    plt.legend()
    plt.title(f"{phase_name} Accuracy")

    plt.savefig(output_dir / f"{phase_name}_accuracy.png")
    plt.close()

    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, loss, label="Training Loss")
    plt.plot(epochs_range, val_loss, label="Validation Loss")
    plt.legend()
    plt.title(f"{phase_name} Loss")

    plt.savefig(output_dir / f"{phase_name}_loss.png")
    plt.close()


# -----------------------------
# Main
# -----------------------------
def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--dataset_dir",
        type=str,
        required=True,
    )

    parser.add_argument(
        "--output_dir",
        type=str,
        default="model",
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=15,
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=32,
    )

    args = parser.parse_args()

    dataset_dir = Path(args.dataset_dir)
    output_dir = Path(args.output_dir)

    # Load datasets
    (
        train_ds,
        val_ds,
        test_ds,
        class_indices,
        class_weights,
    ) = load_datasets(
        dataset_dir=dataset_dir,
        batch_size=args.batch_size,
    )

    # Build model
    model, base_model = build_model(
        num_classes=len(class_indices)
    )

    # Train model
    history_phase1, history_fine = train_model(
        model=model,
        base_model=base_model,
        train_ds=train_ds,
        val_ds=val_ds,
        epochs=args.epochs,
        output_dir=output_dir,
        class_weights=class_weights,
    )

    # Final evaluation
    evaluate_model(model, test_ds)

    # Save final model
    model.save(output_dir / "paddy_model.keras")

    # Save class mapping
    with open(output_dir / "class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=4)

    # Save training plots
    plot_training_history(
        history_phase1,
        output_dir,
        "phase1",
    )

    print("Training completed successfully.")


if __name__ == "__main__":
    main()