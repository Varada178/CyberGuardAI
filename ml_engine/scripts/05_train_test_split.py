from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
import logging

# ======================================================
# Logging Configuration
# ======================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# ======================================================
# Paths
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET = BASE_DIR / "dataset" / "processed" / "cleaned_dataset.csv"

OUTPUT_DIR = BASE_DIR / "dataset" / "split"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = BASE_DIR / "reports" / "train_test_split"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# ======================================================
# Load Dataset
# ======================================================

logging.info("Loading cleaned dataset...")

df = pd.read_csv(DATASET)

logging.info(f"Dataset Shape : {df.shape}")

# ======================================================
# Train Test Split
# ======================================================

logging.info("Performing Stratified Train-Test Split...")

train_df, test_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["Label"]
)

logging.info(f"Training Shape : {train_df.shape}")
logging.info(f"Testing Shape  : {test_df.shape}")

# ======================================================
# Save Datasets
# ======================================================

train_path = OUTPUT_DIR / "train.csv"
test_path = OUTPUT_DIR / "test.csv"

train_df.to_csv(train_path, index=False)
test_df.to_csv(test_path, index=False)

logging.info("Datasets Saved Successfully.")

# ======================================================
# Distribution Report
# ======================================================

train_distribution = train_df["Label"].value_counts()
test_distribution = test_df["Label"].value_counts()

train_distribution.to_csv(REPORT_DIR / "train_distribution.csv")
test_distribution.to_csv(REPORT_DIR / "test_distribution.csv")

# ======================================================
# Summary Report
# ======================================================

summary = {
    "Metric": [
        "Total Samples",
        "Training Samples",
        "Testing Samples",
        "Training Percentage",
        "Testing Percentage",
        "Number of Classes"
    ],
    "Value": [
        len(df),
        len(train_df),
        len(test_df),
        "80%",
        "20%",
        df["Label"].nunique()
    ]
}

summary_df = pd.DataFrame(summary)

summary_df.to_csv(
    REPORT_DIR / "split_summary.csv",
    index=False
)

# ======================================================
# Console Output
# ======================================================

logging.info("=" * 60)
logging.info("TRAIN TEST SPLIT COMPLETED")
logging.info("=" * 60)

print("\nTraining Distribution\n")
print(train_distribution)

print("\nTesting Distribution\n")
print(test_distribution)

print("\nTrain Dataset Saved To:")
print(train_path)

print("\nTest Dataset Saved To:")
print(test_path)