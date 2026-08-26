from pathlib import Path
import logging
import joblib
import pandas as pd
import numpy as np

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

print("\n========== CYBERGUARD AI PREDICTION ==========\n")

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models"

INPUT_FILE = (
    BASE_DIR
    / "dataset"
    / "split"
    / "test.csv"
)

OUTPUT_DIR = (
    BASE_DIR
    / "reports"
    / "prediction"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Model
# =====================================================

logging.info("Loading trained model...")

model = joblib.load(MODEL_DIR / "random_forest.pkl")

encoder = joblib.load(MODEL_DIR / "label_encoder.pkl")

training_features = pd.read_csv(
    MODEL_DIR / "training_features.csv"
)["Feature"].tolist()

logging.info("Model Loaded Successfully.")

# =====================================================
# Load Dataset
# =====================================================

logging.info("Loading input dataset...")

df = pd.read_csv(INPUT_FILE)

logging.info(f"Dataset Shape : {df.shape}")

# =====================================================
# Preprocessing (Same as Training)
# =====================================================

df.columns = df.columns.str.strip()

df.replace([np.inf, -np.inf], np.nan, inplace=True)

df.dropna(inplace=True)

actual_labels = None

if "Label" in df.columns:
    actual_labels = df["Label"]
    df = df.drop(columns=["Label"])

object_cols = df.select_dtypes(include=["object"]).columns.tolist()

if len(object_cols) > 0:
    df = df.drop(columns=object_cols)

df = df.select_dtypes(include=["number"])

# =====================================================
# Keep Training Features
# =====================================================

missing_features = list(set(training_features) - set(df.columns))

if len(missing_features) > 0:
    raise ValueError(
        f"Missing Features : {missing_features}"
    )

X = df[training_features]

# =====================================================
# Prediction
# =====================================================

logging.info("Predicting attack classes...")

predictions = model.predict(X)

probabilities = model.predict_proba(X)

predicted_labels = encoder.inverse_transform(predictions)

confidence = probabilities.max(axis=1) * 100

# =====================================================
# Risk Level
# =====================================================

def risk_level(conf):

    if conf >= 95:
        return "High"

    elif conf >= 80:
        return "Medium"

    else:
        return "Low"

# =====================================================
# Recommendation
# =====================================================

def recommendation(label):

    if label == "BENIGN":
        return "No Action Required"

    return "Block Source IP and Investigate"

# =====================================================
# Build Results
# =====================================================

results = pd.DataFrame({

    "Predicted_Attack": predicted_labels,

    "Confidence(%)": confidence.round(2),

    "Risk_Level": [risk_level(c) for c in confidence],

    "Recommendation": [
        recommendation(a)
        for a in predicted_labels
    ]

})

if actual_labels is not None:
    results.insert(0, "Actual_Label", actual_labels.values)

# =====================================================
# Save Results
# =====================================================

output_file = OUTPUT_DIR / "predictions.csv"

results.to_csv(
    output_file,
    index=False
)

# =====================================================
# Display Sample Predictions
# =====================================================

print("\nSample Predictions\n")

print(results.head(20))

print("\nPrediction Summary\n")

print(results["Predicted_Attack"].value_counts())

print("\nResults Saved To:\n")

print(output_file)

logging.info("=" * 60)
logging.info("PREDICTION COMPLETED")
logging.info("=" * 60)