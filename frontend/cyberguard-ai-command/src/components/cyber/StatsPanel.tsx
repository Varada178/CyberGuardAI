import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

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
  const [stats, setStats] = useState({
    packets: 3245,
    connections: 128,
    threats: 7,
    accuracy: 98.4,
    cpu: 34,
    memory: 62,
    latency: 12,
    confidence: 94.2,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setStats({
        packets: 3000 + Math.floor(Math.random() * 4000),
        connections: 100 + Math.floor(Math.random() * 80),
        threats: Math.floor(Math.random() * 15),
        accuracy: 97 + Math.random() * 2.5,
        cpu: 20 + Math.random() * 50,
        memory: 45 + Math.random() * 35,
        latency: 8 + Math.random() * 20,
        confidence: 88 + Math.random() * 11,
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "Packets/s", value: stats.packets, color: "text-cyan" },
    { label: "Connections", value: stats.connections, color: "text-electric" },
    { label: "Threats", value: stats.threats, color: "text-danger" },
    { label: "Accuracy %", value: stats.accuracy, color: "text-safe", decimals: 1 },
    { label: "CPU %", value: stats.cpu, color: "text-cyan", decimals: 0 },
    { label: "Memory %", value: stats.memory, color: "text-electric", decimals: 0 },
    { label: "Latency ms", value: stats.latency, color: "text-warn", decimals: 0 },
    { label: "Confidence %", value: stats.confidence, color: "text-safe", decimals: 1 },
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
            <div className="mt-1 h-0.5 w-full overflow-hidden rounded bg-white/5">
              <motion.div
                className="h-full bg-current opacity-60"
                animate={{ width: `${Math.min(100, (it.value / (it.label.includes("Packets") ? 8000 : it.label.includes("Connections") ? 200 : 100)) * 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
