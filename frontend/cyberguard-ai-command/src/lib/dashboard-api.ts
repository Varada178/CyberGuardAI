import { apiRequest } from "@/lib/api";
import type { PredictionResult } from "@/lib/prediction-api";

export type DashboardOverview = {
  total_samples: number;
  attack_samples: number;
  attack_types: number;
  model_accuracy: number;
  model_f1_score: number;
  user_analyses: number;
  user_threats_detected: number;
  recent_alerts_count: number;
  top_attacks: Array<{ label: string; count: number; is_attack: boolean }>;
};

export type ThreatItem = {
  label: string;
  count: number;
  is_attack: boolean;
};

export type ModelMetrics = {
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  classes: Array<{
    label: string;
    precision: number;
    recall: number;
    f1_score: number;
    support: number;
  }>;
};

export type RecentPrediction = {
  id: string;
  predicted_attack: string;
  confidence: number;
  risk_level: string;
  is_attack: boolean;
  recommendation: string;
  created_at: string;
};

export type AlertItem = {
  id: string;
  title: string;
  confidence: number;
  risk_level: string;
  recommendation: string;
  created_at: string;
};

export type UserStats = {
  analyses: number;
  threats_detected: number;
  model_accuracy: number;
};

type DataResponse<T> = { success: true; data: T };

export async function fetchDashboardOverview(token: string) {
  const response = await apiRequest<DataResponse<DashboardOverview>>(
    "/api/prediction/dashboard/overview/",
    { token },
  );
  return response.data;
}

export async function fetchDashboardThreats(token: string) {
  const response = await apiRequest<DataResponse<ThreatItem[]>>(
    "/api/prediction/dashboard/threats/",
    { token },
  );
  return response.data;
}

export async function fetchDashboardModelMetrics(token: string) {
  const response = await apiRequest<DataResponse<ModelMetrics>>(
    "/api/prediction/dashboard/model-metrics/",
    { token },
  );
  return response.data;
}

export async function fetchRecentPredictions(token: string, limit = 20) {
  const response = await apiRequest<DataResponse<RecentPrediction[]>>(
    `/api/prediction/dashboard/recent/?limit=${limit}`,
    { token },
  );
  return response.data;
}

export async function fetchDashboardAlerts(token: string, limit = 10) {
  const response = await apiRequest<DataResponse<AlertItem[]>>(
    `/api/prediction/dashboard/alerts/?limit=${limit}`,
    { token },
  );
  return response.data;
}

export async function fetchUserStats(token: string) {
  const response = await apiRequest<DataResponse<UserStats>>(
    "/api/prediction/dashboard/user-stats/",
    { token },
  );
  return response.data;
}

export type { PredictionResult };
