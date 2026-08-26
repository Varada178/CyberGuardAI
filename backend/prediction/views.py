from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .dashboard_service import DashboardService
from .serializers import BatchPredictionSerializer, FlowFeaturesSerializer
from .services import PredictionService


class RequiredFeaturesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        features = PredictionService.required_features()
        return Response(
            {
                "success": True,
                "count": len(features),
                "features": features,
            },
            status=status.HTTP_200_OK,
        )


class PredictAttackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FlowFeaturesSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = PredictionService.predict(
                serializer.validated_data["features"]
            )
            DashboardService.log_prediction(request.user, result)
        except ValueError as exc:
            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": "Prediction completed successfully.",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class BatchPredictAttackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BatchPredictionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        samples = [
            item["features"]
            for item in serializer.validated_data["samples"]
        ]

        try:
            results = PredictionService.predict_batch(samples)
            for result in results:
                DashboardService.log_prediction(request.user, result)
        except ValueError as exc:
            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": "Batch prediction completed successfully.",
                "data": {
                    "count": len(results),
                    "predictions": results,
                },
            },
            status=status.HTTP_200_OK,
        )


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": DashboardService.overview(request.user),
            },
            status=status.HTTP_200_OK,
        )


class DashboardThreatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": DashboardService.threat_breakdown(),
            },
            status=status.HTTP_200_OK,
        )


class DashboardModelMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": DashboardService.model_performance(),
            },
            status=status.HTTP_200_OK,
        )


class DashboardRecentPredictionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 20))
        return Response(
            {
                "success": True,
                "data": DashboardService.recent_predictions(request.user, limit),
            },
            status=status.HTTP_200_OK,
        )


class DashboardAlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 10))
        return Response(
            {
                "success": True,
                "data": DashboardService.alerts(request.user, limit),
            },
            status=status.HTTP_200_OK,
        )


class DashboardUserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": DashboardService.user_stats(request.user),
            },
            status=status.HTTP_200_OK,
        )
