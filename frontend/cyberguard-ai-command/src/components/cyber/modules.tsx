import { motion } from "motion/react";
import {
  Shield,
  Activity,
  Radio,
  Globe2,
  Brain,
  Cpu,
  Sparkles,
  FileText,
  Bell,
  ClipboardList,
  BarChart3,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ModuleDef {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "ok" | "warn" | "danger";
  metric: string;
}

export const MODULES: ModuleDef[] = [
  { id: "threats", label: "Threat Detection", icon: Shield, status: "warn", metric: "7 active" },
  { id: "network", label: "Network Traffic", icon: Activity, status: "ok", metric: "3.2k pkt/s" },
  { id: "intel", label: "Threat Intelligence", icon: Globe2, status: "ok", metric: "10 regions" },
  { id: "ai", label: "AI Prediction Engine", icon: Brain, status: "ok", metric: "98.4%" },
  { id: "model", label: "Model Performance", icon: Cpu, status: "ok", metric: "F1 0.97" },
  { id: "future", label: "Future AI · CTGAN", icon: Sparkles, status: "ok", metric: "beta" },
  { id: "logs", label: "System Logs", icon: FileText, status: "ok", metric: "2,847" },
  { id: "alerts", label: "Alerts", icon: Bell, status: "danger", metric: "3 new" },
  { id: "reports", label: "Reports", icon: ClipboardList, status: "ok", metric: "daily" },
  { id: "analytics", label: "Analytics", icon: BarChart3, status: "ok", metric: "live" },
  { id: "traffic", label: "Traffic Monitor", icon: Radio, status: "ok", metric: "12 nodes" },
  { id: "health", label: "AI Health", icon: Zap, status: "ok", metric: "nominal" },
];

const statusRing = {
  ok: "border-safe/40 shadow-[0_0_20px_rgba(80,230,150,0.25)]",
  warn: "border-warn/50 shadow-[0_0_20px_rgba(255,170,50,0.3)]",
  danger: "border-danger/60 shadow-[0_0_20px_rgba(255,80,80,0.35)]",
};
const statusDot = {
  ok: "bg-safe",
  warn: "bg-warn",
  danger: "bg-danger",
};

export function ModuleTile({ m, onClick, index }: { m: ModuleDef; onClick: () => void; index: number }) {
  const Icon = m.icon;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05 * index, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative glass rounded-xl p-3 text-left border ${statusRing[m.status]} transition-all overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan/10 via-transparent to-electric/10" />
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity animate-shine" />
      <div className="relative flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/30">
          <Icon className="h-4 w-4 text-cyan" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
            {m.label}
          </div>
          <div className="text-xs text-foreground/90 font-mono truncate">{m.metric}</div>
        </div>
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[m.status]} shadow-[0_0_8px_currentColor] animate-pulse`} />
      </div>
    </motion.button>
  );
}
