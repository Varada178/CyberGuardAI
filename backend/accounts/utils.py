import random
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import OTP


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user):
    OTP.objects.filter(user=user).delete()

    otp = generate_otp()

    OTP.objects.create(
        user=user,
        code=otp,
        expires_at=timezone.now() + timedelta(minutes=10),
        is_verified=False,
    )

    send_mail(
        subject="CyberGuard AI - Email Verification OTP",
        message=(
            f"Hello {user.first_name},\n\n"
            f"Your OTP is:\n\n"
            f"{otp}\n\n"
            f"Valid for 10 minutes.\n\n"
            f"CyberGuard AI"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
