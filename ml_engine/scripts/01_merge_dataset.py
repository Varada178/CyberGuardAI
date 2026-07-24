from pathlib import Path
import pandas as pd

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "dataset" / "raw"
MERGED_DIR = BASE_DIR / "dataset" / "merged"

MERGED_DIR.mkdir(parents=True, exist_ok=True)

# Find all CSV files
csv_files = sorted(RAW_DIR.rglob("*.csv"))

if not csv_files:
    raise FileNotFoundError(f"No CSV files found in {RAW_DIR}")

print(f"\nFound {len(csv_files)} CSV files:\n")

dataframes = []

for file in csv_files:
    print(f"Reading: {file.name}")

    df = pd.read_csv(file)

    # Track source file (useful later)
    df["source_file"] = file.name

    print(f"Shape: {df.shape}")

    dataframes.append(df)

print("\nMerging datasets...")

merged_df = pd.concat(dataframes, ignore_index=True)

print("\nMerge Complete")
print(f"Final Shape: {merged_df.shape}")

output_file = MERGED_DIR / "merged_dataset.csv"
merged_df.to_csv(output_file, index=False)

print(f"\nMerged dataset saved to:\n{output_file}")