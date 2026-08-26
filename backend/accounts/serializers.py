from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


# ======================================================
# Register Serializer
# ======================================================

class RegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True
    )

    class Meta:

        model = User

        fields = [

            "first_name",
            "last_name",
            "email",
            "phone_number",
            "password",
            "confirm_password"

        ]

        extra_kwargs = {

            "password": {
                "write_only": True,
                "min_length": 8,
            }

        }

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:

            raise serializers.ValidationError({

                "confirm_password":
                "Passwords do not match."

            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        user = User.objects.create_user(

            password=password,

            **validated_data

        )

        return user


# ======================================================
# Login Serializer
# ======================================================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField()

    def validate(self, attrs):

        email = attrs.get("email")

        password = attrs.get("password")

        user = authenticate(

            username=email,

            password=password

        )

        if not user:

            raise serializers.ValidationError({

                "non_field_errors": ["Invalid email or password."]

            })

        if not user.is_verified:

            raise serializers.ValidationError({

                "non_field_errors": ["Please verify your email first."]

            })

        attrs["user"] = user

        return attrs


# ======================================================
# Verify OTP Serializer
# ======================================================

class VerifyOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(max_length=6)


# ======================================================
# Forgot Password Serializer
# ======================================================

class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        if not User.objects.filter(email=value).exists():

            raise serializers.ValidationError(

                "User not found."

            )

        return value


# ======================================================
# Reset Password Serializer
# ======================================================

class ResetPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(max_length=6)

    new_password = serializers.CharField(

        min_length=8,

        write_only=True

    )

    confirm_password = serializers.CharField(

        write_only=True

    )

    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:

            raise serializers.ValidationError({

                "confirm_password":
                "Passwords do not match."

            })

        return attrs


# ======================================================
# Profile Serializer
# ======================================================

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [

            "id",

            "first_name",

            "last_name",

            "email",

            "phone_number",

            "profile_picture",

            "is_verified",

            "date_joined"

        ]

        read_only_fields = (

            "id",

            "email",

            "is_verified",

            "date_joined"

        )


class ProfileUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [

            "first_name",

            "last_name",

            "phone_number",

        ]