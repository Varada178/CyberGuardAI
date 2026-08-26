from django.contrib import admin

from .models import User
from .models import OTP


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_verified",
        "is_staff",
    )

    search_fields = (
        "email",
        "first_name",
        "last_name",
    )

    list_filter = (
        "is_verified",
        "is_staff",
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "code",
        "created_at",
        "expires_at",
        "is_verified",
    )