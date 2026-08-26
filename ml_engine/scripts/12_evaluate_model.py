from pathlib import Path
import logging
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

print("\n========== MODEL EVALUATION STARTED ==========\n")

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TEST_DATASET = (
    BASE_DIR /
    "dataset" /
    "split" /
    "test.csv"
)

MODEL_DIR = BASE_DIR / "models"

REPORT_DIR = (
    BASE_DIR /
    "reports" /
    "evaluation"
)

REPORT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Test Dataset
# =====================================================

logging.info("Loading Test Dataset...")

df = pd.read_csv(TEST_DATASET)

logging.info(f"Dataset Shape : {df.shape}")

# =====================================================
# Apply Same Preprocessing
# =====================================================

logging.info("Applying preprocessing...")

df.columns = df.columns.str.strip()

df.replace([np.inf, -np.inf], np.nan, inplace=True)

df.dropna(inplace=True)

# =====================================================
# Separate Features and Labels
# =====================================================

y_true = df["Label"]

X = df.drop(columns=["Label"])

# Remove object columns

object_cols = X.select_dtypes(include=["object"]).columns.tolist()

if len(object_cols) > 0:

    X = X.drop(columns=object_cols)

# Keep only numeric

X = X.select_dtypes(include=["number"])

# =====================================================
# Load Training Features
# =====================================================

feature_file = MODEL_DIR / "training_features.csv"

features = pd.read_csv(feature_file)["Feature"].tolist()

X = X[features]

# =====================================================
# Load Model
# =====================================================

logging.info("Loading Random Forest Model...")

model = joblib.load(
    MODEL_DIR / "random_forest.pkl"
)

encoder = joblib.load(
    MODEL_DIR / "label_encoder.pkl"
)

# =====================================================
# Encode Labels
# =====================================================

y_true_encoded = encoder.transform(y_true)

# =====================================================
# Prediction
# =====================================================

logging.info("Predicting...")

y_pred = model.predict(X)

# =====================================================
# Metrics
# =====================================================

accuracy = accuracy_score(
    y_true_encoded,
    y_pred
)

precision = precision_score(
    y_true_encoded,
    y_pred,
    average="weighted"
)

recall = recall_score(
    y_true_encoded,
    y_pred,
    average="weighted"
)

f1 = f1_score(
    y_true_encoded,
    y_pred,
    average="weighted"
)

print("\nAccuracy :", accuracy)

print("Precision :", precision)

print("Recall :", recall)

print("F1 Score :", f1)

# =====================================================
# Save Metrics
# =====================================================

with open(
    REPORT_DIR / "metrics.txt",
    "w"
) as f:

    f.write(f"Accuracy : {accuracy:.6f}\n")

    f.write(f"Precision : {precision:.6f}\n")

    f.write(f"Recall : {recall:.6f}\n")

    f.write(f"F1 Score : {f1:.6f}\n")

# =====================================================
# Classification Report
# =====================================================

report = classification_report(

    y_true_encoded,

    y_pred,

    target_names=encoder.classes_,

    output_dict=True

)

pd.DataFrame(report).transpose().to_csv(

    REPORT_DIR / "classification_report.csv"

)

# =====================================================
# Confusion Matrix
# =====================================================

cm = confusion_matrix(
    y_true_encoded,
    y_pred
)

pd.DataFrame(
    cm,
    index=encoder.classes_,
    columns=encoder.classes_
).to_csv(
    REPORT_DIR / "confusion_matrix.csv"
)

disp = ConfusionMatrixDisplay(

    confusion_matrix=cm,

    display_labels=encoder.classes_

)

fig, ax = plt.subplots(figsize=(14, 14))

disp.plot(
    cmap="Blues",
    ax=ax,
    xticks_rotation=90,
    colorbar=False
)

plt.tight_layout()

plt.savefig(

    REPORT_DIR / "confusion_matrix.png",

    dpi=300

)

plt.close()

# =====================================================
# Save Predictions
# =====================================================

predictions = pd.DataFrame({

    "Actual": encoder.inverse_transform(y_true_encoded),

    "Predicted": encoder.inverse_transform(y_pred)

})

predictions.to_csv(

    REPORT_DIR / "predictions.csv",

    index=False

)

# =====================================================
# Misclassified Samples
# =====================================================

misclassified = df.copy()

misclassified["Actual"] = encoder.inverse_transform(y_true_encoded)

misclassified["Predicted"] = encoder.inverse_transform(y_pred)

misclassified = misclassified[
    misclassified["Actual"] != misclassified["Predicted"]
]

misclassified.to_csv(

    REPORT_DIR / "misclassified_samples.csv",

    index=False

)

# =====================================================
# Finish
# =====================================================

logging.info("=" * 60)

logging.info("MODEL EVALUATION COMPLETED")

logging.info("=" * 60)

print("\nEvaluation Reports Saved To:\n")

print(REPORT_DIR)