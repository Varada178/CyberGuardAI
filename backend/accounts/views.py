from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, OTP
from .serializers import (
    LoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    VerifyOTPSerializer,
)
from .utils import send_otp_email


def _error_response(errors, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {
            "success": False,
            "errors": errors,
        },
        status=status_code,
    )


def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return _error_response(serializer.errors)

        user = serializer.save()
        send_otp_email(user)

        return Response(
            {
                "success": True,
                "message": "Registration successful. OTP sent to your email.",
                "data": {
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return _error_response(serializer.errors)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            otp_obj = OTP.objects.get(user=user)
        except OTP.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "OTP not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if otp_obj.is_verified:
            return Response(
                {
                    "success": False,
                    "message": "OTP already verified.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.is_expired():
            return Response(
                {
                    "success": False,
                    "message": "OTP expired.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.code != otp:
            return Response(
                {
                    "success": False,
                    "message": "Invalid OTP.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj.is_verified = True
        otp_obj.save()

        user.is_verified = True
        user.save(update_fields=["is_verified"])

        tokens = _get_tokens_for_user(user)

        return Response(
            {
                "success": True,
                "message": "Email verified successfully.",
                "data": {
                    **tokens,
                    "user": ProfileSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return _error_response(serializer.errors)

        user = serializer.validated_data["user"]
        tokens = _get_tokens_for_user(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    **tokens,
                    "user": ProfileSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get the currently logged-in user's profile.
        """
        serializer = ProfileSerializer(request.user)

        return Response(
            {
                "success": True,
                "message": "Profile fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        """
        Update the complete user profile.
        """
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
        )

        if not serializer.is_valid():
            return _error_response(serializer.errors)

        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        """
        Partially update the user's profile.
        """
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return _error_response(serializer.errors)

        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logout the current user by blacklisting
        the refresh token.
        """

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return _error_response(
                {
                    "refresh": [
                        "Refresh token is required."
                    ]
                }
            )

        try:
            token = RefreshToken(refresh_token)

            token.blacklist()

            return Response(
                {
                    "success": True,
                    "message": "Logout successful.",
                },
                status=status.HTTP_200_OK,
            )

        except TokenError:
            return Response(
                {
                    "success": False,
                    "message": "Invalid or expired refresh token.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )