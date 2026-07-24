from pathlib import Path
import logging
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

print("\n========== FEATURE SELECTION STARTED ==========\n")

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "dataset" / "final" / "balanced_train.csv"

OUTPUT_DIR = BASE_DIR / "dataset" / "selected_features"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = BASE_DIR / "reports" / "feature_selection"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Dataset
# =====================================================

logging.info("Loading balanced dataset...")

df = pd.read_csv(DATASET_PATH)

logging.info(f"Dataset Shape : {df.shape}")

# Remove spaces from column names
df.columns = df.columns.str.strip()

# =====================================================
# Separate Target
# =====================================================

y = df["Label"]

# Remove Label
X = df.drop(columns=["Label"])

# =====================================================
# Remove ALL object columns
# =====================================================

object_cols = X.select_dtypes(include=["object"]).columns.tolist()

print("\nObject Columns Found:")
print(object_cols)

if len(object_cols) > 0:
    X = X.drop(columns=object_cols)

# =====================================================
# Keep ONLY numeric columns
# =====================================================

X = X.select_dtypes(include=["number"])

print("\nFinal Feature Count :", X.shape[1])

print("\nRemaining Object Columns:")
print(X.select_dtypes(include=["object"]).columns.tolist())

# =====================================================
# Encode Labels
# =====================================================

encoder = LabelEncoder()

y_encoded = encoder.fit_transform(y)

joblib.dump(
    encoder,
    MODEL_DIR / "label_encoder.pkl"
)

# =====================================================
# Train Temporary RF
# =====================================================

logging.info("Training Random Forest...")

rf = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

rf.fit(X, y_encoded)

logging.info("Training Completed.")

# =====================================================
# Feature Importance
# =====================================================

importance = pd.DataFrame({

    "Feature": X.columns,

    "Importance": rf.feature_importances_

})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

importance.to_csv(
    REPORT_DIR / "feature_importance.csv",
    index=False
)

# =====================================================
# Select Top Features
# =====================================================

TOP = 30

selected = importance.head(TOP)["Feature"].tolist()

pd.DataFrame({
    "Feature": selected
}).to_csv(
    MODEL_DIR / "selected_features.csv",
    index=False
)

# =====================================================
# Save Selected Dataset
# =====================================================

selected_df = X[selected].copy()

selected_df["Label"] = y

selected_df.to_csv(
    OUTPUT_DIR / "selected_dataset.csv",
    index=False
)

# =====================================================
# Plot
# =====================================================

plt.figure(figsize=(12,8))

top = importance.head(TOP)

plt.barh(
    top["Feature"][::-1],
    top["Importance"][::-1]
)

plt.title("Top 30 Feature Importance")

plt.xlabel("Importance")

plt.tight_layout()

plt.savefig(
    REPORT_DIR / "feature_importance.png",
    dpi=300
)

plt.close()

# =====================================================
# Output
# =====================================================

print("\n============================")
print("TOP FEATURES")
print("============================")

for i, f in enumerate(selected, 1):
    print(f"{i}. {f}")

print("\nSelected Dataset Saved:")
print(OUTPUT_DIR / "selected_dataset.csv")

logging.info("=" * 60)
logging.info("FEATURE SELECTION COMPLETED")
logging.info("=" * 60)