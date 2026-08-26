import { motion } from "motion/react";
import { Shield, Brain, Cpu, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export interface ModuleDef {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "ok" | "warn" | "danger";
  metric: string;
}

const statusRing: Record<ModuleDef["status"], string> = {
  ok: "border-safe/40 shadow-[0_0_20px_rgba(80,230,150,0.25)]",
  warn: "border-warn/50 shadow-[0_0_20px_rgba(255,170,50,0.3)]",
  danger:
    "border-danger/60 shadow-[0_0_20px_rgba(255,80,80,0.35)]",
};

const statusDot: Record<ModuleDef["status"], string> = {
  ok: "bg-safe",
  warn: "bg-warn",
  danger: "bg-danger",
};

export function useModules(): ModuleDef[] {
  const { overview, modelMetrics, alerts } = useDashboard();

  const safeAlerts = alerts ?? [];

  const accuracy =
    overview?.model_accuracy != null
      ? overview.model_accuracy.toFixed(1)
      : "0.0";

  const f1Score =
    modelMetrics?.metrics?.f1_score != null
      ? modelMetrics.metrics.f1_score.toFixed(1)
      : "0.0";

  const attackTypes = overview?.attack_types ?? 0;

  const userThreats = overview?.user_threats_detected ?? 0;

  return [
    {
      id: "threats",
      label: "Threat Detection",
      icon: Shield,
      status: userThreats > 0 ? "warn" : "ok",
      metric: `${attackTypes} types`,
    },

    {
      id: "ai",
      label: "AI Prediction Engine",
      icon: Brain,
      status: "ok",
      metric: `${accuracy}% acc`,
    },

    {
      id: "model",
      label: "Model Performance",
      icon: Cpu,
      status: "ok",
      metric: `F1 ${f1Score}%`,
    },

    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      status: safeAlerts.length > 0 ? "danger" : "ok",
      metric: `${safeAlerts.length} active`,
    },
  ];
}

interface ModuleTileProps {
  m: ModuleDef;
  onClick: () => void;
  index: number;
}

export function ModuleTile({
  m,
  onClick,
  index,
}: ModuleTileProps) {
  const Icon = m.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: 0.05 * index,
        duration: 0.5,
        ease: "easeOut",
      }}
      whileHover={{
        y: -4,
        scale: 1.03,
      }}
      whileTap={{
        scale: 0.97,
      }}
      className={`group relative glass rounded-xl p-3 text-left border ${
        statusRing[m.status]
      } transition-all overflow-hidden`}
    >
      <div className="relative flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/30">
          <Icon className="h-4 w-4 text-cyan" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
            {m.label}
          </div>

          <div className="text-xs text-foreground/90 font-mono truncate">
            {m.metric}
          </div>
        </div>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            statusDot[m.status]
          } animate-pulse`}
        />
      </div>
    </motion.button>
  );
}