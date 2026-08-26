from pathlib import Path

import pandas as pd
from django.conf import settings
from django.db.models import Count

from .models import PredictionLog


def _reports_dir() -> Path:
    return Path(settings.PROJECT_ROOT) / "ml_engine" / "reports"


def get_model_metrics() -> dict:
    metrics_file = _reports_dir() / "evaluation" / "metrics.txt"
    metrics = {
        "accuracy": 0.0,
        "precision": 0.0,
        "recall": 0.0,
        "f1_score": 0.0,
    }

    if not metrics_file.exists():
        return metrics

    for line in metrics_file.read_text(encoding="utf-8").splitlines():
        if ":" not in line:
            continue
        key, value = [part.strip() for part in line.split(":", 1)]
        normalized = key.lower().replace(" ", "_")
        if normalized in metrics:
            metrics[normalized] = round(float(value) * 100, 2)

    return metrics


def get_attack_distribution() -> list[dict]:
    distribution_file = _reports_dir() / "eda" / "attack_distribution.csv"

    if not distribution_file.exists():
        return []

    frame = pd.read_csv(distribution_file)
    frame.columns = frame.columns.str.strip()

    label_column = "Label" if "Label" in frame.columns else frame.columns[0]
    count_column = "count" if "count" in frame.columns else frame.columns[1]

    rows = []
    for _, row in frame.iterrows():
        label = str(row[label_column]).strip()
        count = int(row[count_column])
        rows.append(
            {
                "label": label,
                "count": count,
                "is_attack": label.upper() != "BENIGN",
            }
        )

    rows.sort(key=lambda item: item["count"], reverse=True)
    return rows


def get_classification_report() -> list[dict]:
    report_file = _reports_dir() / "evaluation" / "classification_report.csv"

    if not report_file.exists():
        return []

    frame = pd.read_csv(report_file)
    rows = []

    for _, row in frame.iterrows():
        label = str(row.iloc[0]).strip()
        if label in {"accuracy", "macro avg", "weighted avg"}:
            continue

        rows.append(
            {
                "label": label,
                "precision": round(float(row["precision"]) * 100, 2),
                "recall": round(float(row["recall"]) * 100, 2),
                "f1_score": round(float(row["f1-score"]) * 100, 2),
                "support": int(float(row["support"])),
            }
        )

    return rows


class DashboardService:
    @staticmethod
    def overview(user) -> dict:
        distribution = get_attack_distribution()
        metrics = get_model_metrics()
        user_predictions = PredictionLog.objects.filter(user=user)

        total_samples = sum(item["count"] for item in distribution)
        attack_samples = sum(
            item["count"] for item in distribution if item["is_attack"]
        )
        attack_types = sum(1 for item in distribution if item["is_attack"])

        user_analyses = user_predictions.count()
        user_threats = user_predictions.filter(is_attack=True).count()
        recent_alerts = user_predictions.filter(is_attack=True)[:5]

        return {
            "total_samples": total_samples,
            "attack_samples": attack_samples,
            "attack_types": attack_types,
            "model_accuracy": metrics["accuracy"],
            "model_f1_score": metrics["f1_score"],
            "user_analyses": user_analyses,
            "user_threats_detected": user_threats,
            "recent_alerts_count": recent_alerts.count(),
            "top_attacks": [
                item for item in distribution if item["is_attack"]
            ][:5],
        }

    @staticmethod
    def user_stats(user) -> dict:
        metrics = get_model_metrics()
        user_predictions = PredictionLog.objects.filter(user=user)

        return {
            "analyses": user_predictions.count(),
            "threats_detected": user_predictions.filter(is_attack=True).count(),
            "model_accuracy": metrics["accuracy"],
        }

    @staticmethod
    def recent_predictions(user, limit: int = 20) -> list[dict]:
        logs = PredictionLog.objects.filter(user=user).order_by("-created_at")[:limit]
        return [
            {
                "id": str(log.id),
                "predicted_attack": log.predicted_attack,
                "confidence": log.confidence,
                "risk_level": log.risk_level,
                "is_attack": log.is_attack,
                "recommendation": log.recommendation,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]

    @staticmethod
    def alerts(user, limit: int = 10) -> list[dict]:
        logs = (
            PredictionLog.objects.filter(user=user, is_attack=True)
            .order_by("-created_at")[:limit]
        )
        return [
            {
                "id": str(log.id),
                "title": f"{log.predicted_attack} detected",
                "confidence": log.confidence,
                "risk_level": log.risk_level,
                "recommendation": log.recommendation,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]

    @staticmethod
    def threat_breakdown() -> list[dict]:
        return [item for item in get_attack_distribution() if item["is_attack"]]

    @staticmethod
    def model_performance() -> dict:
        metrics = get_model_metrics()
        return {
            "metrics": metrics,
            "classes": get_classification_report(),
        }

    @staticmethod
    def log_prediction(user, result: dict) -> None:
        PredictionLog.objects.create(
            user=user,
            predicted_attack=result["predicted_attack"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            is_attack=result["is_attack"],
            recommendation=result["recommendation"],
        )
