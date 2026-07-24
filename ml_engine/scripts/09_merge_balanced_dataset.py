from pathlib import Path
import pandas as pd
import logging

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TRAIN_FILE = BASE_DIR / "dataset" / "split" / "train.csv"

SYNTHETIC_DIR = BASE_DIR / "dataset" / "synthetic"

OUTPUT_DIR = BASE_DIR / "dataset" / "final"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = BASE_DIR / "reports" / "final_dataset"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Original Training Dataset
# =====================================================

logging.info("Loading Original Training Dataset...")

train_df = pd.read_csv(TRAIN_FILE)

logging.info(f"Original Shape : {train_df.shape}")

# =====================================================
# Load Synthetic Files
# =====================================================

synthetic_frames = []

csv_files = list(SYNTHETIC_DIR.glob("*.csv"))

logging.info(f"Synthetic Files Found : {len(csv_files)}")

for file in csv_files:

    logging.info(f"Reading : {file.name}")

    df = pd.read_csv(file)

    synthetic_frames.append(df)

# =====================================================
# Merge Synthetic Data
# =====================================================

if synthetic_frames:

    synthetic_df = pd.concat(
        synthetic_frames,
        ignore_index=True
    )

else:

    synthetic_df = pd.DataFrame()

logging.info(f"Synthetic Shape : {synthetic_df.shape}")

# =====================================================
# Merge Original + Synthetic
# =====================================================

balanced_df = pd.concat(
    [train_df, synthetic_df],
    ignore_index=True
)

logging.info(f"Balanced Shape : {balanced_df.shape}")

# =====================================================
# Shuffle Dataset
# =====================================================

balanced_df = balanced_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

# =====================================================
# Save Dataset
# =====================================================

output_file = OUTPUT_DIR / "balanced_train.csv"

balanced_df.to_csv(output_file, index=False)

# =====================================================
# Reports
# =====================================================

distribution = balanced_df["Label"].value_counts()

distribution.to_csv(
    REPORT_DIR / "balanced_distribution.csv"
)

summary = pd.DataFrame({

    "Metric": [

        "Original Rows",

        "Synthetic Rows",

        "Balanced Rows",

        "Features",

        "Classes"

    ],

    "Value": [

        len(train_df),

        len(synthetic_df),

        len(balanced_df),

        balanced_df.shape[1]-1,

        balanced_df["Label"].nunique()

    ]

})

summary.to_csv(

    REPORT_DIR / "summary.csv",

    index=False

)

# =====================================================
# Console
# =====================================================

print("\n==============================")
print("BALANCED DATASET SUMMARY")
print("==============================\n")

print(distribution)

logging.info("="*60)
logging.info("MERGING COMPLETED")
logging.info("="*60)

print("\nSaved To:")
print(output_file)