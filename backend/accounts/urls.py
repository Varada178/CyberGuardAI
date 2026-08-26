from django.urls import path

from .profile_views import LogoutView, ProfileView
from .views import (
    LoginView,
    RegisterView,
    VerifyOTPView,
)

urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp"
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout"
    ),

]
