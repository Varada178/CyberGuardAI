from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
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

DATASET = BASE_DIR / "dataset" / "processed" / "cleaned_dataset.csv"

REPORT_DIR = BASE_DIR / "reports" / "data_analysis"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Dataset
# =====================================================

logging.info("Loading cleaned dataset...")

df = pd.read_csv(DATASET)

logging.info(f"Dataset Shape : {df.shape}")

# =====================================================
# Class Distribution
# =====================================================

logging.info("Calculating class distribution...")

class_counts = (
    df["Label"]
    .value_counts()
    .sort_values(ascending=False)
)

print("\n========== CLASS DISTRIBUTION ==========\n")
print(class_counts)

class_counts.to_csv(REPORT_DIR / "class_distribution.csv")

# =====================================================
# Plot Distribution
# =====================================================

plt.figure(figsize=(12,6))

class_counts.plot(kind="bar")

plt.title("Attack Distribution")

plt.xlabel("Attack Type")

plt.ylabel("Number of Samples")

plt.xticks(rotation=45, ha="right")

plt.tight_layout()

plt.savefig(REPORT_DIR / "attack_distribution.png")

plt.close()

# =====================================================
# CTGAN Planning
# =====================================================

logging.info("Preparing CTGAN augmentation plan...")

TARGET_SIZE = 5000

plan = []

for attack, count in class_counts.items():

    if attack == "BENIGN":
        continue

    if count < TARGET_SIZE:

        synthetic = TARGET_SIZE - count

        strategy = "CTGAN"

    else:

        synthetic = 0

        strategy = "Keep Original"

    plan.append({
        "Attack": attack,
        "Original Samples": count,
        "Target Samples": max(count, TARGET_SIZE),
        "Synthetic Required": synthetic,
        "Strategy": strategy
    })

plan_df = pd.DataFrame(plan)

plan_df.to_csv(
    REPORT_DIR / "ctgan_plan.csv",
    index=False
)

print("\n========== CTGAN PLAN ==========\n")
print(plan_df)

# =====================================================
# Minority Classes
# =====================================================

minority = plan_df[
    plan_df["Synthetic Required"] > 0
]

minority.to_csv(
    REPORT_DIR / "minority_classes.csv",
    index=False
)

# =====================================================
# Summary Report
# =====================================================

with open(REPORT_DIR / "analysis_summary.txt", "w") as f:

    f.write("CyberGuard AI - Data Analysis\n")
    f.write("=" * 50 + "\n\n")

    f.write(f"Total Samples : {len(df):,}\n")
    f.write(f"Total Features : {len(df.columns)-1}\n")
    f.write(f"Total Classes : {df['Label'].nunique()}\n\n")

    f.write("Minority Classes\n")
    f.write("----------------------\n")

    for _, row in minority.iterrows():

        f.write(
            f"{row['Attack']} : "
            f"{row['Synthetic Required']} synthetic samples\n"
        )

logging.info("=" * 60)
logging.info("DATA ANALYSIS COMPLETED")
logging.info("=" * 60)

print("\nReports saved to:")
print(REPORT_DIR)