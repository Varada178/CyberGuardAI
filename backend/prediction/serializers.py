from rest_framework import serializers

from .models import PredictionLog
from .services import PredictionService


class FlowFeaturesSerializer(serializers.Serializer):
    features = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Network flow feature values used by the trained model.",
    )

    def validate_features(self, value):
        required = set(PredictionService.required_features())
        provided = set(value.keys())
        missing = sorted(required - provided)

        if missing:
            raise serializers.ValidationError({"missing_features": missing})

        return value


class BatchPredictionSerializer(serializers.Serializer):
    samples = FlowFeaturesSerializer(many=True)


class PredictionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionLog
        fields = [
            "id",
            "predicted_attack",
            "confidence",
            "risk_level",
            "is_attack",
            "recommendation",
            "created_at",
        ]
