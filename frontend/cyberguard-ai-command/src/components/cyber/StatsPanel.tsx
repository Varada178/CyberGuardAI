import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useDashboard } from "@/context/DashboardContext";

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });
  const rounded = useTransform(spring, (v) => v.toFixed(decimals));
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export function StatsPanel() {
  const { overview, userStats, loading } = useDashboard();

  if (loading && !overview) {
    return (
      <div className="glass rounded-2xl p-4 w-full">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading telemetry...</div>
      </div>
    );
  }

  const items = [
    { label: "Your Analyses", value: overview?.user_analyses ?? 0, color: "text-cyan", decimals: 0 },
    { label: "Threats Found", value: overview?.user_threats_detected ?? 0, color: "text-danger", decimals: 0 },
    { label: "Model Accuracy %", value: overview?.model_accuracy ?? 0, color: "text-safe", decimals: 1 },
    { label: "Attack Types", value: overview?.attack_types ?? 0, color: "text-electric", decimals: 0 },
    { label: "Dataset Samples", value: overview?.total_samples ?? 0, color: "text-cyan", decimals: 0 },
    { label: "Active Alerts", value: overview?.recent_alerts_count ?? 0, color: "text-warn", decimals: 0 },
    { label: "F1 Score %", value: overview?.model_f1_score ?? 0, color: "text-safe", decimals: 1 },
    { label: "Your Accuracy %", value: userStats?.model_accuracy ?? 0, color: "text-safe", decimals: 1 },
  ];

  return (
    <div className="glass rounded-2xl p-4 w-full">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live Telemetry</div>
        <span className="flex items-center gap-1 text-[10px] text-safe">
          <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" /> LIVE
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.label}</div>
            <div className={`mt-1 text-lg font-light ${it.color} text-glow`} style={{ fontFamily: "Orbitron" }}>
              <Counter value={it.value} decimals={it.decimals ?? 0} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
