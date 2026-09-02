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
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .dashboard_service import DashboardService
from .pdf_extractor import PDFFeatureExtractor, PDFExtractionError
from .serializers import (
    BatchPredictionSerializer,
    FlowFeaturesSerializer,
)
from .services import PredictionService


class PDFPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # ==========================================================
        # 1. CHECK FILE
        # ==========================================================

        pdf_file = request.FILES.get("file")

        if not pdf_file:
            return Response(
                {
                    "success": False,
                    "message": "Please upload a PDF file.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================================
        # 2. CHECK FILE EXTENSION
        # ==========================================================

        if not pdf_file.name.lower().endswith(".pdf"):
            return Response(
                {
                    "success": False,
                    "message": "Only PDF files are supported.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================================
        # 3. CHECK EMPTY FILE
        # ==========================================================

        if pdf_file.size == 0:
            return Response(
                {
                    "success": False,
                    "message": "The uploaded PDF is empty.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            # ======================================================
            # 4. GET FEATURES REQUIRED BY THE ML MODEL
            # ======================================================

            required_features = (
                PredictionService.required_features()
            )

            if not required_features:

                return Response(
                    {
                        "success": False,
                        "message": (
                            "No required ML features "
                            "are configured."
                        ),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # ======================================================
            # 5. EXTRACT FEATURES FROM PDF
            # ======================================================

            samples = PDFFeatureExtractor.extract_features(
                pdf_file,
                required_features,
            )

            if not samples:

                return Response(
                    {
                        "success": False,
                        "message": (
                            "No valid network-flow records "
                            "were found in the PDF."
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ======================================================
            # 6. SINGLE RECORD
            # ======================================================

            if len(samples) == 1:

                sample = samples[0]

                features = sample["features"]

                serializer = FlowFeaturesSerializer(
                    data={
                        "features": features
                    }
                )

                if not serializer.is_valid():

                    return Response(
                        {
                            "success": False,
                            "type": "single",
                            "message": (
                                "Extracted features "
                                "failed validation."
                            ),
                            "errors": serializer.errors,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # --------------------------------------------------
                # Run ML prediction
                # --------------------------------------------------

                result = PredictionService.predict(
                    serializer.validated_data["features"]
                )

                # --------------------------------------------------
                # Log prediction
                # --------------------------------------------------

                DashboardService.log_prediction(
                    request.user,
                    result,
                )

                # --------------------------------------------------
                # Return response
                # --------------------------------------------------

                return Response(
                    {
                        "success": True,
                        "type": "single",
                        "message": (
                            "PDF extracted and prediction "
                            "completed successfully."
                        ),
                        "data": {
                            "record": sample.get("record"),
                            "feature_count": len(features),
                            "extracted_features": features,
                            "prediction": result,
                        },
                    },
                    status=status.HTTP_200_OK,
                )

            # ======================================================
            # 7. MULTIPLE RECORDS
            # ======================================================

            batch_serializer = BatchPredictionSerializer(
                data={
                    "samples": samples
                }
            )

            if not batch_serializer.is_valid():

                return Response(
                    {
                        "success": False,
                        "type": "batch",
                        "message": (
                            "One or more extracted "
                            "network flows are invalid."
                        ),
                        "errors": batch_serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ------------------------------------------------------
            # Extract validated feature dictionaries
            # ------------------------------------------------------

            validated_samples = [
                item["features"]
                for item
                in batch_serializer.validated_data["samples"]
            ]

            # ======================================================
            # 8. RUN BATCH ML PREDICTION
            # ======================================================

            results = PredictionService.predict_batch(
                validated_samples
            )

            print("\n==============================")
            print("NUMBER OF EXTRACTED SAMPLES:", len(samples))
            print("==============================")

            for i, sample in enumerate(samples, start=1):
                print(f"RECORD {i} FEATURES:", len(sample["features"]))

            print("\n==============================")
            ("NUMBER OF PREDICTIONS:", len(results))
            print("==============================")

            for i, result in enumerate(results, start=1):
                print(f"RECORD {i} RESULT:", result)

            print("==============================\n")

           


            # ======================================================
            # 9. LOG EACH PREDICTION
            # ======================================================

            for result in results:

                DashboardService.log_prediction(
                    request.user,
                    result,
                )

            # ======================================================
            # 10. ADD RECORD NUMBERS TO RESULTS
            # ======================================================

            predictions = []

            for index, result in enumerate(results):

                record_number = samples[index].get(
                    "record",
                    index + 1,
                )

                predictions.append(
                    {
                        "record": record_number,
                        "prediction": result,
                    }
                )

            # ======================================================
            # 11. RETURN BATCH RESULT
            # ======================================================

            return Response(
                {
                    "success": True,
                    "type": "batch",
                    "message": (
                        "PDF extracted and batch prediction "
                        "completed successfully."
                    ),
                    "data": {
                        "count": len(predictions),
                        "feature_count": len(required_features),
                        "predictions": predictions,
                    },
                },
                status=status.HTTP_200_OK,
            )

        # ==========================================================
        # PDF EXTRACTION ERROR
        # ==========================================================

        except PDFExtractionError as exc:

            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================================
        # ML / VALIDATION ERROR
        # ==========================================================

        except ValueError as exc:

            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================================
        # UNEXPECTED ERROR
        # ==========================================================

        except Exception:

            return Response(
                {
                    "success": False,
                    "message": (
                        "An unexpected error occurred "
                        "while processing the PDF."
                    ),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )