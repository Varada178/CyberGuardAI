from pathlib import Path
import pandas as pd
import numpy as np
import logging
import time

# ======================================================
# Logging Configuration
# ======================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

start_time = time.time()

# ======================================================
# Project Paths
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MERGED_DATASET = BASE_DIR / "dataset" / "merged" / "merged_dataset.csv"

PROCESSED_DIR = BASE_DIR / "dataset" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = BASE_DIR / "reports" / "preprocessing"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PROCESSED_DIR / "cleaned_dataset.csv"

# ======================================================
# Load Dataset
# ======================================================

logging.info("Loading merged dataset...")

df = pd.read_csv(MERGED_DATASET)

logging.info(f"Dataset Shape : {df.shape}")

initial_rows = len(df)

# ======================================================
# Remove Leading / Trailing Spaces
# ======================================================

logging.info("Cleaning column names...")

df.columns = df.columns.str.strip()

# ======================================================
# Replace Infinity Values
# ======================================================

logging.info("Replacing Infinity values with NaN...")

df.replace([np.inf, -np.inf], np.nan, inplace=True)

# ======================================================
# Missing Values
# ======================================================

logging.info("Checking missing values...")

missing_before = df.isnull().sum().sum()

logging.info(f"Missing Values Before : {missing_before}")

# Since missing values are very few,
# removing rows is acceptable.

df.dropna(inplace=True)

missing_after = df.isnull().sum().sum()

logging.info(f"Missing Values After : {missing_after}")

# ======================================================
# Remove Duplicate Rows
# ======================================================

logging.info("Removing duplicate rows...")

duplicates = df.duplicated().sum()

logging.info(f"Duplicate Rows Found : {duplicates}")

df.drop_duplicates(inplace=True)

logging.info(f"Dataset Shape After Duplicate Removal : {df.shape}")

# ======================================================
# Remove Constant Columns
# ======================================================

logging.info("Removing constant columns...")

constant_columns = []

for col in df.columns:

    if df[col].nunique() == 1:

        constant_columns.append(col)

df.drop(columns=constant_columns, inplace=True)

logging.info(f"Removed {len(constant_columns)} constant columns.")

# ======================================================
# Clean Label Names
# ======================================================

logging.info("Cleaning Label Names...")

df["Label"] = (
    df["Label"]
    .astype(str)
    .str.replace("�", "-", regex=False)
    .str.strip()
)

# ======================================================
# Optimize Data Types
# ======================================================

logging.info("Optimizing numeric data types...")

for col in df.select_dtypes(include=["int64"]).columns:

    df[col] = pd.to_numeric(df[col], downcast="integer")

for col in df.select_dtypes(include=["float64"]).columns:

    df[col] = pd.to_numeric(df[col], downcast="float")

# ======================================================
# Dataset Summary
# ======================================================

logging.info("Generating preprocessing report...")

summary = {
    "Initial Rows": initial_rows,
    "Final Rows": len(df),
    "Rows Removed": initial_rows - len(df),
    "Columns": len(df.columns),
    "Constant Columns Removed": len(constant_columns),
    "Duplicate Rows Removed": duplicates,
    "Missing Values Removed": missing_before,
}

report = pd.DataFrame(summary.items(), columns=["Metric", "Value"])

report.to_csv(REPORT_DIR / "preprocessing_report.csv", index=False)

pd.DataFrame(
    constant_columns,
    columns=["Removed Constant Columns"]
).to_csv(
    REPORT_DIR / "removed_constant_columns.csv",
    index=False
)

# ======================================================
# Save Dataset
# ======================================================

logging.info("Saving cleaned dataset...")

df.to_csv(OUTPUT_FILE, index=False)

logging.info(f"Saved to : {OUTPUT_FILE}")

# ======================================================
# Final Information
# ======================================================

logging.info("=" * 60)
logging.info("PREPROCESSING COMPLETED")
logging.info("=" * 60)

logging.info(f"Final Dataset Shape : {df.shape}")

logging.info(f"Execution Time : {(time.time()-start_time):.2f} seconds")