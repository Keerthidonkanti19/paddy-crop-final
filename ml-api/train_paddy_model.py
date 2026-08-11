# ============================================================
# Paddy Crop Disease Detection - Model Training
# MobileNetV2 Transfer Learning + Fine Tuning
# ============================================================

import argparse
import json
import logging
from pathlib import Path
from typing import Tuple

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf

from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

tf.keras.utils.set_random_seed(SEED)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)

logger = logging.getLogger("paddy-train")


# ============================================================
# DATA LOADING
# ============================================================

def load_datasets(
    dataset_dir: Path,
    img_size: Tuple[int, int] = (224, 224),
    batch_size: int = 32,
):

    train_dir = dataset_dir / "train"
    val_dir = dataset_dir / "val"
    test_dir = dataset_dir / "test"

    if not train_dir.exists():
        raise FileNotFoundError(f"Training directory not found: {train_dir}")

    if not val_dir.exists():
        raise FileNotFoundError(f"Validation directory not found: {val_dir}")

    if not test_dir.exists():
        raise FileNotFoundError(f"Test directory not found: {test_dir}")

    logger.info("Loading training data from: %s", train_dir)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=img_size,
        batch_size=batch_size,
        shuffle=True,
        seed=SEED,
    )

    logger.info("Loading validation data from: %s", val_dir)

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=img_size,
        batch_size=batch_size,
        shuffle=False,
    )

    logger.info("Loading test data from: %s", test_dir)

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=img_size,
        batch_size=batch_size,
        shuffle=False,
    )

    class_names = train_ds.class_names

    class_indices = {
        index: name
        for index, name in enumerate(class_names)
    }

    logger.info("Detected classes:")
    for index, name in class_indices.items():
        logger.info("  %d -> %s", index, name)

    # ========================================================
    # CLASS WEIGHTS
    # ========================================================

    logger.info("Calculating class weights...")

    train_labels = []

    for _, labels in train_ds:
        batch_labels = tf.argmax(labels, axis=1).numpy()
        train_labels.extend(batch_labels)

    train_labels = np.array(train_labels)

    unique_classes = np.unique(train_labels)

    weights = compute_class_weight(
        class_weight="balanced",
        classes=unique_classes,
        y=train_labels,
    )

    class_weights = {
        int(class_id): float(weight)
        for class_id, weight in zip(unique_classes, weights)
    }

    logger.info("Class weights:")
    for class_id, weight in class_weights.items():
        logger.info(
            "  %d (%s): %.4f",
            class_id,
            class_indices[class_id],
            weight,
        )

    # ========================================================
    # PERFORMANCE
    # ========================================================

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = train_ds.prefetch(AUTOTUNE)
    val_ds = val_ds.prefetch(AUTOTUNE)
    test_ds = test_ds.prefetch(AUTOTUNE)

    return (
        train_ds,
        val_ds,
        test_ds,
        class_indices,
        class_weights,
    )


# ============================================================
# MODEL
# ============================================================

def build_model(
    num_classes: int,
    img_size: Tuple[int, int] = (224, 224),
):

    inputs = layers.Input(
        shape=(img_size[0], img_size[1], 3),
        name="input_image",
    )

    # ========================================================
    # DATA AUGMENTATION
    # ========================================================

    data_augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomZoom(0.10),
            layers.RandomTranslation(
                height_factor=0.05,
                width_factor=0.05,
            ),
            layers.RandomContrast(0.10),
        ],
        name="data_augmentation",
    )

    x = data_augmentation(inputs)

    # MobileNetV2 preprocessing
    x = preprocess_input(x)

    # ========================================================
    # MOBILENETV2
    # ========================================================

    base_model = MobileNetV2(
        input_shape=(img_size[0], img_size[1], 3),
        include_top=False,
        weights="imagenet",
    )

    # Initially freeze entire base model
    base_model.trainable = False

    x = base_model(x, training=False)

    # ========================================================
    # CLASSIFICATION HEAD
    # ========================================================

    x = layers.GlobalAveragePooling2D(name="global_average_pooling")(x)

    x = layers.BatchNormalization(name="batch_normalization")(x)

    x = layers.Dense(
        128,
        activation="relu",
        name="dense_128",
    )(x)

    x = layers.Dropout(
        0.40,
        name="dropout",
    )(x)

    outputs = layers.Dense(
        num_classes,
        activation="softmax",
        name="disease_output",
    )(x)

    model = models.Model(
        inputs=inputs,
        outputs=outputs,
        name="PaddyDiseaseMobileNetV2",
    )

    # ========================================================
    # PHASE 1 COMPILE
    # ========================================================

    model.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=1e-4
        ),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model, base_model


# ============================================================
# CALLBACKS
# ============================================================

def create_callbacks(model_path: Path, patience: int = 5):

    return [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_accuracy",
            mode="max",
            save_best_only=True,
            verbose=1,
        ),

        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=patience,
            restore_best_weights=True,
            verbose=1,
        ),

        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
    ]


# ============================================================
# FINE-TUNING SETUP
# ============================================================

def prepare_fine_tuning(
    model,
    base_model,
    fine_tune_layers: int = 40,
):

    logger.info("Preparing MobileNetV2 for fine tuning...")

    # First freeze everything
    base_model.trainable = True

    # Freeze all layers except the final fine_tune_layers
    total_layers = len(base_model.layers)

    freeze_until = max(
        0,
        total_layers - fine_tune_layers,
    )

    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False

    # Keep BatchNormalization layers frozen.
    # This makes fine tuning more stable on smaller datasets.
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    trainable_count = sum(
        1 for layer in base_model.layers
        if layer.trainable
    )

    logger.info(
        "MobileNetV2 total layers: %d",
        total_layers,
    )

    logger.info(
        "MobileNetV2 trainable layers: %d",
        trainable_count,
    )

    # ========================================================
    # RECOMPILE WITH SMALL LEARNING RATE
    # ========================================================

    model.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=1e-5
        ),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )


# ============================================================
# TRAINING
# ============================================================

def train_model(
    model,
    base_model,
    train_ds,
    val_ds,
    total_epochs,
    output_dir,
    class_weights,
):

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_path = output_dir / "paddy_model.keras"

    # ========================================================
    # SPLIT TOTAL EPOCHS INTO TWO PHASES
    # ========================================================

    phase1_epochs = max(
        1,
        total_epochs // 2,
    )

    phase2_epochs = max(
        1,
        total_epochs - phase1_epochs,
    )

    logger.info(
        "Total requested epochs: %d",
        total_epochs,
    )

    logger.info(
        "Phase 1 epochs: %d",
        phase1_epochs,
    )

    logger.info(
        "Phase 2 epochs: %d",
        phase2_epochs,
    )

    # ========================================================
    # PHASE 1
    # ========================================================

    logger.info("")
    logger.info("==============================================")
    logger.info("PHASE 1: TRANSFER LEARNING")
    logger.info("MobileNetV2 frozen")
    logger.info("==============================================")
    logger.info("")

    phase1_callbacks = create_callbacks(
        model_path,
        patience=4,
    )

    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=phase1_epochs,
        callbacks=phase1_callbacks,
        class_weight=class_weights,
        verbose=1,
    )

    # ========================================================
    # LOAD BEST PHASE 1 MODEL
    # ========================================================

    if model_path.exists():

        logger.info(
            "Loading best Phase 1 model..."
        )

        model = tf.keras.models.load_model(
            model_path
        )

    # ========================================================
    # PHASE 2
    # ========================================================

    logger.info("")
    logger.info("==============================================")
    logger.info("PHASE 2: FINE TUNING")
    logger.info("Unfreezing final MobileNetV2 layers")
    logger.info("==============================================")
    logger.info("")

    prepare_fine_tuning(
        model,
        base_model,
        fine_tune_layers=40,
    )

    phase2_callbacks = create_callbacks(
        model_path,
        patience=5,
    )

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        initial_epoch=phase1_epochs,
        epochs=total_epochs,
        callbacks=phase2_callbacks,
        class_weight=class_weights,
        verbose=1,
    )

    # ========================================================
    # LOAD ABSOLUTE BEST MODEL
    # ========================================================

    logger.info("")
    logger.info("Loading absolute best model...")
    logger.info("")

    best_model = tf.keras.models.load_model(
        model_path
    )

    return (
        best_model,
        history_phase1,
        history_phase2,
    )


# ============================================================
# EVALUATION
# ============================================================

def evaluate_model(
    model,
    test_ds,
    class_indices,
    output_dir,
):

    logger.info("")
    logger.info("==============================================")
    logger.info("FINAL TEST EVALUATION")
    logger.info("==============================================")
    logger.info("")

    test_loss, test_accuracy = model.evaluate(
        test_ds,
        verbose=1,
    )

    print("\n======================================")
    print("FINAL MODEL PERFORMANCE")
    print("======================================")
    print(f"Test Accuracy : {test_accuracy:.4f}")
    print(f"Test Loss     : {test_loss:.4f}")
    print("======================================\n")

    # ========================================================
    # PREDICTIONS
    # ========================================================

    y_true = []
    y_pred = []

    for images, labels in test_ds:

        predictions = model.predict(
            images,
            verbose=0,
        )

        predicted_classes = np.argmax(
            predictions,
            axis=1,
        )

        true_classes = np.argmax(
            labels.numpy(),
            axis=1,
        )

        y_true.extend(true_classes)
        y_pred.extend(predicted_classes)

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    class_names = [
        class_indices[i]
        for i in range(len(class_indices))
    ]

    # ========================================================
    # CLASSIFICATION REPORT
    # ========================================================

    report = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4,
    )

    print("\n======================================")
    print("CLASSIFICATION REPORT")
    print("======================================")
    print(report)

    report_path = output_dir / "classification_report.txt"

    with open(
        report_path,
        "w",
        encoding="utf-8",
    ) as f:

        f.write(
            "Paddy Disease Classification Report\n\n"
        )

        f.write(
            f"Test Accuracy: {test_accuracy:.4f}\n\n"
        )

        f.write(report)

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

    cm = confusion_matrix(
        y_true,
        y_pred,
    )

    plt.figure(
        figsize=(8, 7)
    )

    plt.imshow(cm)

    plt.title(
        "Paddy Disease Confusion Matrix"
    )

    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")

    plt.xticks(
        range(len(class_names)),
        class_names,
        rotation=45,
        ha="right",
    )

    plt.yticks(
        range(len(class_names)),
        class_names,
    )

    for i in range(len(class_names)):
        for j in range(len(class_names)):

            plt.text(
                j,
                i,
                cm[i, j],
                ha="center",
                va="center",
            )

    plt.tight_layout()

    plt.savefig(
        output_dir / "confusion_matrix.png",
        dpi=200,
    )

    plt.close()

    logger.info(
        "Confusion matrix saved."
    )

    return test_accuracy


# ============================================================
# TRAINING GRAPHS
# ============================================================

def plot_history(
    history,
    output_dir,
    phase_name,
):

    if history is None:
        return

    accuracy = history.history.get(
        "accuracy",
        [],
    )

    val_accuracy = history.history.get(
        "val_accuracy",
        [],
    )

    loss = history.history.get(
        "loss",
        [],
    )

    val_loss = history.history.get(
        "val_loss",
        [],
    )

    epochs = range(
        1,
        len(accuracy) + 1,
    )

    # ========================================================
    # ACCURACY
    # ========================================================

    plt.figure(
        figsize=(8, 6)
    )

    plt.plot(
        epochs,
        accuracy,
        label="Training Accuracy",
    )

    plt.plot(
        epochs,
        val_accuracy,
        label="Validation Accuracy",
    )

    plt.title(
        f"{phase_name} Accuracy"
    )

    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")

    plt.legend()

    plt.grid(
        alpha=0.3
    )

    plt.tight_layout()

    plt.savefig(
        output_dir / f"{phase_name}_accuracy.png",
        dpi=200,
    )

    plt.close()

    # ========================================================
    # LOSS
    # ========================================================

    plt.figure(
        figsize=(8, 6)
    )

    plt.plot(
        epochs,
        loss,
        label="Training Loss",
    )

    plt.plot(
        epochs,
        val_loss,
        label="Validation Loss",
    )

    plt.title(
        f"{phase_name} Loss"
    )

    plt.xlabel("Epoch")
    plt.ylabel("Loss")

    plt.legend()

    plt.grid(
        alpha=0.3
    )

    plt.tight_layout()

    plt.savefig(
        output_dir / f"{phase_name}_loss.png",
        dpi=200,
    )

    plt.close()


# ============================================================
# SAVE CLASS MAPPING
# ============================================================

def save_class_indices(
    class_indices,
    output_dir,
):

    class_indices_path = (
        output_dir / "class_indices.json"
    )

    with open(
        class_indices_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            class_indices,
            f,
            indent=4,
        )

    logger.info(
        "Class mapping saved to: %s",
        class_indices_path,
    )


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Train Paddy Crop Disease "
            "MobileNetV2 classifier"
        )
    )

    parser.add_argument(
        "--dataset_dir",
        type=str,
        required=True,
        help="Path containing train/val/test",
    )

    parser.add_argument(
        "--output_dir",
        type=str,
        default="model",
        help="Directory for model outputs",
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=30,
        help="Total training epochs",
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=32,
        help="Training batch size",
    )

    args = parser.parse_args()

    dataset_dir = Path(
        args.dataset_dir
    )

    output_dir = Path(
        args.output_dir
    )

    # ========================================================
    # CHECK DATASET
    # ========================================================

    logger.info("")
    logger.info("==============================================")
    logger.info("PADDY DISEASE MODEL TRAINING")
    logger.info("==============================================")
    logger.info("Dataset: %s", dataset_dir)
    logger.info("Output : %s", output_dir)
    logger.info("==============================================")
    logger.info("")

    # ========================================================
    # LOAD DATA
    # ========================================================

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

    # ========================================================
    # BUILD MODEL
    # ========================================================

    model, base_model = build_model(
        num_classes=len(class_indices)
    )

    logger.info(
        "Model created successfully."
    )

    # ========================================================
    # TRAIN
    # ========================================================

    (
        best_model,
        history_phase1,
        history_phase2,
    ) = train_model(
        model=model,
        base_model=base_model,
        train_ds=train_ds,
        val_ds=val_ds,
        total_epochs=args.epochs,
        output_dir=output_dir,
        class_weights=class_weights,
    )

    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    model_path = (
        output_dir / "paddy_model.keras"
    )

    best_model.save(
        model_path
    )

    logger.info(
        "Best model saved to: %s",
        model_path,
    )

    # ========================================================
    # SAVE CLASS INDICES
    # ========================================================

    save_class_indices(
        class_indices,
        output_dir,
    )

    # ========================================================
    # PLOTS
    # ========================================================

    plot_history(
        history_phase1,
        output_dir,
        "phase1",
    )

    plot_history(
        history_phase2,
        output_dir,
        "phase2",
    )

    # ========================================================
    # FINAL EVALUATION
    # ========================================================

    evaluate_model(
        best_model,
        test_ds,
        class_indices,
        output_dir,
    )

    # ========================================================
    # COMPLETE
    # ========================================================

    print("\n")
    print("==============================================")
    print("TRAINING COMPLETED SUCCESSFULLY")
    print("==============================================")
    print(f"Model : {model_path}")
    print(
        f"Classes : {len(class_indices)}"
    )
    print("==============================================")
    print("\n")


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
