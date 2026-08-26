import { apiRequest } from "@/lib/api";

export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  is_verified: boolean;
  date_joined: string;
};

export type AuthPayload = {
  access: string;
  refresh: string;
  user: UserProfile;
};

type SuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
};

export type ProfileUpdateInput = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

export async function registerUser(input: RegisterInput) {
  return apiRequest<SuccessResponse<{ email: string }>>("/api/auth/register/", {
    method: "POST",
    body: input,
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiRequest<SuccessResponse<AuthPayload>>("/api/auth/verify-otp/", {
    method: "POST",
    body: { email, otp },
  });
}

export async function loginUser(email: string, password: string) {
  return apiRequest<SuccessResponse<AuthPayload>>("/api/auth/login/", {
    method: "POST",
    body: { email, password },
  });
}

export async function fetchProfile(token: string) {
  const response = await apiRequest<SuccessResponse<UserProfile>>("/api/auth/profile/", {
    token,
  });
  return response.data;
}

export async function updateProfile(token: string, input: ProfileUpdateInput) {
  const response = await apiRequest<SuccessResponse<UserProfile>>("/api/auth/profile/", {
    method: "PATCH",
    token,
    body: input,
  });
  return response.data;
}

export async function logoutUser(token: string, refresh: string) {
  return apiRequest<{ success: true; message: string }>("/api/auth/logout/", {
    method: "POST",
    token,
    body: { refresh },
  });
}
