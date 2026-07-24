from pathlib import Path
import pandas as pd
import logging
import time
import joblib

from ctgan import CTGAN

# ==========================================================
# Logging
# ==========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET = BASE_DIR / "dataset" / "ctgan" / "ctgan_training.csv"

MODEL_DIR = BASE_DIR / "models" / "ctgan"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Load Dataset
# ==========================================================

logging.info("Loading CTGAN training dataset...")

df = pd.read_csv(DATASET)

logging.info(f"Dataset Shape : {df.shape}")

# ==========================================================
# Classes to Train
# ==========================================================

TRAIN_CLASSES = [

    "SSH-Patator",

    "Bot",

    "Web Attack - Brute Force",

    "Web Attack - XSS"

]

# ==========================================================
# Train Models
# ==========================================================

for attack in TRAIN_CLASSES:

    print("\n")
    logging.info("="*60)
    logging.info(f"Training CTGAN for : {attack}")
    logging.info("="*60)

    class_df = df[df["Label"] == attack].copy()

    logging.info(f"Samples : {len(class_df)}")

    # Remove Label column before training
    train_data = class_df.drop(columns=["Label"])

    # Detect categorical columns
    categorical_columns = train_data.select_dtypes(
        include=["object"]
    ).columns.tolist()

    logging.info(f"Categorical Columns : {categorical_columns}")

    # CTGAN requires batch_size divisible by pac (default 10) and even.
    batch_size = min(250, (len(train_data) // 2) // 10 * 10)
    batch_size = max(batch_size, 20)

    logging.info(f"Batch Size : {batch_size}")

    start = time.time()

    model = CTGAN(

        epochs=300,

        batch_size=batch_size,

        verbose=True

    )

    model.fit(

        train_data,

        discrete_columns=categorical_columns

    )

    elapsed = time.time() - start

    model_file = MODEL_DIR / f"{attack.replace(' ','_').replace('-','_')}.pkl"

    joblib.dump(model, model_file)

    logging.info(f"Saved : {model_file}")

    logging.info(f"Training Time : {elapsed:.2f} sec")

print("\n")
logging.info("="*60)
logging.info("ALL CTGAN MODELS TRAINED")
logging.info("="*60)