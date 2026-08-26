from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from django.conf import settings


def _risk_level(confidence: float) -> str:
    if confidence >= 95:
        return "High"
    if confidence >= 80:
        return "Medium"
    return "Low"


def _recommendation(label: str) -> str:
    if label == "BENIGN":
        return "No Action Required"
    return "Block Source IP and Investigate"


@lru_cache(maxsize=1)
def _load_artifacts():
    model_dir = Path(settings.ML_MODEL_DIR)

    model = joblib.load(model_dir / "random_forest.pkl")
    encoder = joblib.load(model_dir / "label_encoder.pkl")
    features = pd.read_csv(model_dir / "training_features.csv")["Feature"].tolist()

    return model, encoder, features


class PredictionService:
    @staticmethod
    def required_features():
        _, _, features = _load_artifacts()
        return features

    @staticmethod
    def predict(features: dict) -> dict:
        model, encoder, required_features = _load_artifacts()

        missing = [name for name in required_features if name not in features]
        if missing:
            raise ValueError(f"Missing features: {missing}")

        row = {name: features[name] for name in required_features}
        frame = pd.DataFrame([row])

        frame.replace([np.inf, -np.inf], np.nan, inplace=True)
        if frame.isnull().any().any():
            null_cols = frame.columns[frame.isnull().any()].tolist()
            raise ValueError(f"Invalid feature values in: {null_cols}")

        prediction = model.predict(frame)[0]
        probabilities = model.predict_proba(frame)[0]

        label = encoder.inverse_transform([prediction])[0]
        confidence = round(float(probabilities.max() * 100), 2)

        class_probabilities = {
            encoder.inverse_transform([index])[0]: round(float(prob) * 100, 2)
            for index, prob in enumerate(probabilities)
        }

        return {
            "predicted_attack": label,
            "confidence": confidence,
            "risk_level": _risk_level(confidence),
            "recommendation": _recommendation(label),
            "is_attack": label != "BENIGN",
            "class_probabilities": class_probabilities,
        }

    @staticmethod
    def predict_batch(samples: list[dict]) -> list[dict]:
        return [PredictionService.predict(sample) for sample in samples]
