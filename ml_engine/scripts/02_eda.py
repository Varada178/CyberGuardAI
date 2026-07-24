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

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "dataset" / "final" / "balanced_train.csv"

OUTPUT_DATASET = BASE_DIR / "dataset" / "selected_features"
OUTPUT_DATASET.mkdir(parents=True, exist_ok=True)

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

# =====================================================
# Remove Non-Numeric Columns
# =====================================================

logging.info("Separating Features and Target...")

y = df["Label"]

X = df.drop(columns=["Label"])

object_cols = X.select_dtypes(include=["object"]).columns.tolist()

if len(object_cols) > 0:

    logging.info(f"Removing Object Columns : {object_cols}")

    X = X.drop(columns=object_cols)

logging.info(f"Feature Shape : {X.shape}")

# =====================================================
# Encode Labels
# =====================================================

logging.info("Encoding Labels...")

encoder = LabelEncoder()

y_encoded = encoder.fit_transform(y)

joblib.dump(
    encoder,
    MODEL_DIR / "label_encoder.pkl"
)

logging.info("Label Encoder Saved.")

# =====================================================
# Train Random Forest
# =====================================================

logging.info("Training Temporary Random Forest...")

rf = RandomForestClassifier(

    n_estimators=200,

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

logging.info("Feature Importance CSV Saved.")

# =====================================================
# Select Top Features
# =====================================================

TOP_FEATURES = 30

selected_features = importance.head(TOP_FEATURES)["Feature"].tolist()

logging.info(f"Selected Top {TOP_FEATURES} Features")

# Save Feature List

pd.DataFrame({

    "Selected_Features": selected_features

}).to_csv(

    MODEL_DIR / "selected_features.csv",

    index=False

)

logging.info("Selected Feature List Saved.")

# =====================================================
# Create Final Dataset
# =====================================================

selected_df = X[selected_features].copy()

selected_df["Label"] = y.values

selected_df.to_csv(

    OUTPUT_DATASET / "selected_dataset.csv",

    index=False

)

logging.info("Selected Dataset Saved.")

# =====================================================
# Plot Feature Importance
# =====================================================

plt.figure(figsize=(12,10))

top = importance.head(TOP_FEATURES)

plt.barh(

    top["Feature"][::-1],

    top["Importance"][::-1]

)

plt.title("Top 30 Feature Importance")

plt.xlabel("Importance Score")

plt.tight_layout()

plt.savefig(

    REPORT_DIR / "feature_importance.png",

    dpi=300

)

plt.close()

logging.info("Feature Importance Plot Saved.")

# =====================================================
# Console Output
# =====================================================

print("\n")

print("="*60)

print("TOP SELECTED FEATURES")

print("="*60)

for i, feature in enumerate(selected_features,1):

    print(f"{i}. {feature}")

print("\n")

logging.info("="*60)

logging.info("FEATURE SELECTION COMPLETED")

logging.info("="*60)

print("\nSelected Dataset Saved To:")

print(OUTPUT_DATASET / "selected_dataset.csv")