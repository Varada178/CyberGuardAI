import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchDashboardAlerts,
  fetchDashboardModelMetrics,
  fetchDashboardOverview,
  fetchDashboardThreats,
  fetchRecentPredictions,
  fetchUserStats,
  type AlertItem,
  type DashboardOverview,
  type ModelMetrics,
  type RecentPrediction,
  type ThreatItem,
  type UserStats,
} from "@/lib/dashboard-api";
import { useAuth } from "@/context/AuthContext";

type DashboardContextValue = {
  overview: DashboardOverview | null;
  threats: ThreatItem[];
  modelMetrics: ModelMetrics | null;
  recentPredictions: RecentPrediction[];
  alerts: AlertItem[];
  userStats: UserStats | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [overviewData, threatsData, metricsData, recentData, alertsData, statsData] =
        await Promise.all([
          fetchDashboardOverview(accessToken),
          fetchDashboardThreats(accessToken),
          fetchDashboardModelMetrics(accessToken),
          fetchRecentPredictions(accessToken),
          fetchDashboardAlerts(accessToken),
          fetchUserStats(accessToken),
        ]);
      setOverview(overviewData);
      setThreats(threatsData);
      setModelMetrics(metricsData);
      setRecentPredictions(recentData);
      setAlerts(alertsData);
      setUserStats(statsData);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      void refresh();
    } else {
      setOverview(null);
      setThreats([]);
      setModelMetrics(null);
      setRecentPredictions([]);
      setAlerts([]);
      setUserStats(null);
    }
  }, [isAuthenticated, accessToken, refresh]);

  const value = useMemo(
    () => ({
      overview,
      threats,
      modelMetrics,
      recentPredictions,
      alerts,
      userStats,
      loading,
      refresh,
    }),
    [overview, threats, modelMetrics, recentPredictions, alerts, userStats, loading, refresh],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}
