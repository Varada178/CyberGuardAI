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

print("\n========== RANDOM FOREST TRAINING STARTED ==========\n")

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "dataset"
    / "selected_features"
    / "selected_dataset.csv"
)

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

REPORT_DIR = (
    BASE_DIR
    / "reports"
    / "model_training"
)

REPORT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Dataset
# =====================================================

logging.info("Loading Selected Dataset...")

df = pd.read_csv(DATASET_PATH)

logging.info(f"Dataset Shape : {df.shape}")

df.columns = df.columns.str.strip()

# =====================================================
# Separate Features & Target
# =====================================================

X = df.drop(columns=["Label"])

y = df["Label"]

logging.info(f"Features : {X.shape[1]}")

logging.info(f"Samples : {X.shape[0]}")

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

logging.info("Training Random Forest...")

rf = RandomForestClassifier(

    n_estimators=300,

    random_state=42,

    n_jobs=-1,

    class_weight="balanced"

)

rf.fit(X, y_encoded)

logging.info("Training Completed.")

# =====================================================
# Save Model
# =====================================================

joblib.dump(

    rf,

    MODEL_DIR / "random_forest.pkl"

)

logging.info("Random Forest Model Saved.")

# =====================================================
# Save Feature Names
# =====================================================

pd.DataFrame({

    "Feature": X.columns

}).to_csv(

    MODEL_DIR / "training_features.csv",

    index=False

)

logging.info("Training Feature List Saved.")

# =====================================================
# Training Accuracy
# =====================================================

train_accuracy = rf.score(

    X,

    y_encoded

)

with open(

    REPORT_DIR / "training_accuracy.txt",

    "w"

) as f:

    f.write(f"Training Accuracy : {train_accuracy:.6f}")

logging.info(f"Training Accuracy : {train_accuracy:.6f}")

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
# Plot Feature Importance
# =====================================================

plt.figure(figsize=(12,8))

top = importance.head(30)

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

print("RANDOM FOREST TRAINING COMPLETED")

print("="*60)

print(f"\nTraining Accuracy : {train_accuracy:.6f}")

print("\nTop 10 Important Features\n")

print(importance.head(10))

print("\nSaved Model :")

print(MODEL_DIR / "random_forest.pkl")

print("\nSaved Label Encoder :")

print(MODEL_DIR / "label_encoder.pkl")

print("\nReports :")

print(REPORT_DIR)

logging.info("="*60)

logging.info("MODEL TRAINING COMPLETED")

logging.info("="*60)