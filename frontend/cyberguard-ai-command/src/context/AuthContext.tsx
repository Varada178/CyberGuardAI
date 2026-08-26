import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError, formatApiErrors } from "@/lib/api";
import {
  fetchProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
  verifyOtp,
  type AuthPayload,
  type ProfileUpdateInput,
  type RegisterInput,
  type UserProfile,
} from "@/lib/auth-api";

const ACCESS_KEY = "cyberguard_access_token";
const REFRESH_KEY = "cyberguard_refresh_token";
const USER_KEY = "cyberguard_user";
const REMEMBER_KEY = "cyberguard_remember";

type AuthContextValue = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (input: RegisterInput) => Promise<string>;
  verifyEmailOtp: (email: string, otp: string, remember?: boolean) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  saveProfile: (input: ProfileUpdateInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function getActiveStorage(): Storage {
  return localStorage.getItem(REMEMBER_KEY) === "0" ? sessionStorage : localStorage;
}

function persistSession(payload: AuthPayload, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  other.removeItem(ACCESS_KEY);
  other.removeItem(REFRESH_KEY);
  other.removeItem(USER_KEY);

  storage.setItem(ACCESS_KEY, payload.access);
  storage.setItem(REFRESH_KEY, payload.refresh);
  storage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

function updateStoredUser(user: UserProfile) {
  const storage = getActiveStorage();
  storage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  for (const key of [ACCESS_KEY, REFRESH_KEY, USER_KEY, REMEMBER_KEY]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const refresh = getStoredRefreshToken();
    const storedUser = readStoredUser();

    if (token && storedUser) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setUser(storedUser);
    }

    setIsBootstrapping(false);
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    try {
      const response = await loginUser(email, password);
      persistSession(response.data, remember);
      setAccessToken(response.data.access);
      setRefreshToken(response.data.refresh);
      setUser(response.data.user);
      setPendingEmail(null);
    } catch (error) {
      if (error instanceof ApiError) throw new Error(formatApiErrors(error.payload));
      throw error;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const response = await registerUser(input);
      setPendingEmail(response.data.email);
      return response.data.email;
    } catch (error) {
      if (error instanceof ApiError) throw new Error(formatApiErrors(error.payload));
      throw error;
    }
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, otp: string, remember = true) => {
    try {
      const response = await verifyOtp(email, otp);
      persistSession(response.data, remember);
      setAccessToken(response.data.access);
      setRefreshToken(response.data.refresh);
      setUser(response.data.user);
      setPendingEmail(null);
    } catch (error) {
      if (error instanceof ApiError) throw new Error(formatApiErrors(error.payload));
      throw error;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    const profile = await fetchProfile(token);
    setUser(profile);
    updateStoredUser(profile);
  }, []);

  const saveProfile = useCallback(async (input: ProfileUpdateInput) => {
    const token = getStoredToken();
    if (!token) throw new Error("Not authenticated.");
    try {
      const profile = await updateProfile(token, input);
      setUser(profile);
      updateStoredUser(profile);
    } catch (error) {
      if (error instanceof ApiError) throw new Error(formatApiErrors(error.payload));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getStoredToken();
    const refresh = getStoredRefreshToken();
    if (token && refresh) {
      try {
        await logoutUser(token, refresh);
      } catch {
        // Clear local session even if API logout fails.
      }
    }
    clearSession();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setPendingEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(user && accessToken),
      isBootstrapping,
      pendingEmail,
      setPendingEmail,
      login,
      register,
      verifyEmailOtp,
      refreshUserProfile,
      saveProfile,
      logout,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isBootstrapping,
      pendingEmail,
      login,
      register,
      verifyEmailOtp,
      refreshUserProfile,
      saveProfile,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
