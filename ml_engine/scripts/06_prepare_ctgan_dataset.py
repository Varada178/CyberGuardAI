from pathlib import Path
import pandas as pd
import logging

# =====================================================
# Logging Configuration
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# =====================================================
# Project Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TRAIN_DATASET = BASE_DIR / "dataset" / "split" / "train.csv"

CTGAN_PLAN = BASE_DIR / "reports" / "data_analysis" / "ctgan_plan.csv"

OUTPUT_DIR = BASE_DIR / "dataset" / "ctgan"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = BASE_DIR / "reports" / "ctgan"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "ctgan_training.csv"

# =====================================================
# Load Data
# =====================================================

logging.info("Loading training dataset...")

train_df = pd.read_csv(TRAIN_DATASET)

logging.info(f"Training Dataset Shape : {train_df.shape}")

logging.info("Loading CTGAN plan...")

plan_df = pd.read_csv(CTGAN_PLAN)

# =====================================================
# Get Classes for CTGAN
# =====================================================

ctgan_classes = plan_df.loc[
    plan_df["Strategy"] == "CTGAN",
    "Attack"
].tolist()

logging.info(f"Classes Selected for CTGAN : {len(ctgan_classes)}")

print("\nCTGAN Classes:")
for attack in ctgan_classes:
    print(f"✓ {attack}")

# =====================================================
# Filter Dataset
# =====================================================

logging.info("Filtering minority attack classes...")

ctgan_df = train_df[
    train_df["Label"].isin(ctgan_classes)
].copy()

logging.info(f"CTGAN Dataset Shape : {ctgan_df.shape}")

# =====================================================
# Save Dataset
# =====================================================

ctgan_df.to_csv(OUTPUT_FILE, index=False)

logging.info("CTGAN dataset saved successfully.")

# =====================================================
# Report
# =====================================================

distribution = ctgan_df["Label"].value_counts()

distribution.to_csv(
    REPORT_DIR / "ctgan_training_distribution.csv"
)

summary = pd.DataFrame({
    "Metric": [
        "Original Training Rows",
        "CTGAN Training Rows",
        "Classes Used",
        "Features"
    ],
    "Value": [
        len(train_df),
        len(ctgan_df),
        len(ctgan_classes),
        len(ctgan_df.columns) - 1
    ]
})

summary.to_csv(
    REPORT_DIR / "ctgan_dataset_summary.csv",
    index=False
)

print("\n==============================")
print("CTGAN DATASET SUMMARY")
print("==============================")

print(f"Rows     : {len(ctgan_df):,}")
print(f"Columns  : {len(ctgan_df.columns)}")
print(f"Classes  : {len(ctgan_classes)}")

print("\nClass Distribution:\n")
print(distribution)

logging.info("=" * 60)
logging.info("CTGAN DATASET PREPARATION COMPLETED")
logging.info("=" * 60)

print("\nDataset Saved To:")
print(OUTPUT_FILE)