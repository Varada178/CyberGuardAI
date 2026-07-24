import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ATTACK_TYPES,
  COUNTRIES,
  randAttack,
  randCountry,
  randIP,
  randSeverity,
  severityBg,
} from "@/lib/cyber-data";

interface Props {
  moduleId: string | null;
  onClose: () => void;
}

const axis = { stroke: "rgba(200,220,255,0.4)", fontSize: 10 };

export function ModulePanel({ moduleId, onClose }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {moduleId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#06070A]/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass neon-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan/20 bg-gradient-to-r from-cyan/5 via-transparent to-electric/5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-cyan">Module</div>
                <div className="text-xl font-light text-glow" style={{ fontFamily: "Orbitron" }}>
                  {getTitle(moduleId)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full border border-cyan/30 flex items-center justify-center hover:bg-cyan/10 transition"
              >
                <X className="h-4 w-4 text-cyan" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderModule(moduleId)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getTitle(id: string) {
  const map: Record<string, string> = {
    threats: "Threat Detection",
    network: "Network Traffic Flow",
    intel: "Global Threat Intelligence",
    ai: "AI Prediction Engine",
    model: "Model Performance",
    future: "Future AI · CTGAN Synthesis",
    logs: "System Logs",
    alerts: "Active Alerts",
    reports: "Reports",
    analytics: "Analytics",
    traffic: "Traffic Monitor",
    health: "AI Health",
  };
  return map[id] ?? id;
}

function renderModule(id: string) {
  switch (id) {
    case "threats": return <ThreatDetection />;
    case "network": return <NetworkTraffic />;
    case "intel": return <ThreatIntel />;
    case "ai": return <PredictionEngine />;
    case "model": return <ModelPerformance />;
    case "future": return <FutureAI />;
    case "logs": return <Logs />;
    case "alerts": return <Alerts />;
    case "reports": return <Reports />;
    case "analytics": return <Analytics />;
    case "traffic": return <TrafficMonitor />;
    case "health": return <AIHealth />;
    default: return null;
  }
}

// ---------- Threat Detection ----------
function ThreatDetection() {
  const [threats] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      name: randAttack(),
      severity: randSeverity(),
      confidence: 70 + Math.random() * 29,
      src: randIP(),
      dst: randIP(),
      packets: Math.floor(Math.random() * 9000) + 100,
      country: randCountry().name,
    })),
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {threats.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-xl border p-4 ${severityBg(t.severity)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70">{t.country}</div>
              <div className="text-lg font-semibold" style={{ fontFamily: "Orbitron" }}>{t.name}</div>
            </div>
            <span className="text-[10px] uppercase tracking-widest border border-current px-2 py-0.5 rounded">
              {t.severity}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-mono">
            <div><div className="opacity-60">SRC</div>{t.src}</div>
            <div><div className="opacity-60">DST</div>{t.dst}</div>
            <div><div className="opacity-60">PKT</div>{t.packets.toLocaleString()}</div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] opacity-70"><span>Risk</span><span>{t.confidence.toFixed(1)}%</span></div>
            <div className="h-1 mt-1 rounded bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-current" initial={{ width: 0 }} animate={{ width: `${t.confidence}%` }} transition={{ duration: 1 }} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, k) => (
              <div key={k} className="flex-1 h-3 rounded-sm bg-current" style={{ opacity: 0.15 + Math.random() * 0.7 }} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Network Traffic ----------
function NetworkTraffic() {
  const nodes = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 60 + (i % 5) * 130,
      y: 80 + Math.floor(i / 5) * 180,
      label: `NODE-${(i + 1).toString().padStart(2, "0")}`,
    })),
  []);
  const edges = useMemo(() => {
    const e: { a: number; b: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = Math.floor(Math.random() * nodes.length);
      const b = Math.floor(Math.random() * nodes.length);
      if (a !== b) e.push({ a, b });
    }
    return e;
  }, [nodes]);

  return (
    <div className="glass rounded-xl p-4">
      <svg viewBox="0 0 720 400" className="w-full h-[400px]">
        <defs>
          <radialGradient id="nodeGrad">
            <stop offset="0%" stopColor="rgba(56,220,255,0.8)" />
            <stop offset="100%" stopColor="rgba(56,220,255,0)" />
          </radialGradient>
        </defs>
        {edges.map((e, i) => {
          const a = nodes[e.a];
          const b = nodes[e.b];
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(56,220,255,0.25)" strokeWidth="0.8" />
              <circle r="3" fill="#38dcff">
                <animateMotion dur={`${2 + (i % 3)}s`} repeatCount="indefinite" path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
              </circle>
              <circle r="2" fill="#ff6b6b">
                <animateMotion dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin="1s" path={`M ${b.x} ${b.y} L ${a.x} ${a.y}`} />
              </circle>
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="24" fill="url(#nodeGrad)" />
            <circle cx={n.x} cy={n.y} r="10" fill="rgba(6,7,10,0.9)" stroke="#38dcff" strokeWidth="1.2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="8" fill="#38dcff" fontFamily="monospace">{n.id + 1}</text>
            <text x={n.x} y={n.y + 34} textAnchor="middle" fontSize="9" fill="rgba(200,220,255,0.6)" fontFamily="monospace">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------- Threat Intel ----------
function ThreatIntel() {
  const [hover, setHover] = useState<typeof COUNTRIES[number] | null>(null);
  const attacks = useMemo(() => Array.from({ length: 12 }, () => {
    const a = randCountry();
    let b = randCountry();
    while (b === a) b = randCountry();
    return { a, b, sev: randSeverity() };
  }), []);
  return (
    <div className="relative glass rounded-xl overflow-hidden">
      <div className="relative aspect-[2/1] cyber-grid animate-grid-drift">
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full">
          {attacks.map((atk, i) => {
            const color = atk.sev === "critical" ? "#ff5555" : atk.sev === "high" ? "#ffaa33" : "#38dcff";
            const midY = (atk.a.y / 2 + atk.b.y / 2) - 8;
            const midX = (atk.a.x + atk.b.x) / 2;
            const path = `M ${atk.a.x} ${atk.a.y / 2} Q ${midX} ${midY} ${atk.b.x} ${atk.b.y / 2}`;
            return (
              <g key={i}>
                <path d={path} fill="none" stroke={color} strokeWidth="0.15" opacity="0.4" />
                <circle r="0.6" fill={color}>
                  <animateMotion dur={`${2 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} path={path} />
                </circle>
              </g>
            );
          })}
          {COUNTRIES.map((c) => (
            <g key={c.code} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
              <circle cx={c.x} cy={c.y / 2} r="1.2" fill="rgba(56,220,255,0.3)" />
              <circle cx={c.x} cy={c.y / 2} r="0.6" fill="#38dcff" />
            </g>
          ))}
        </svg>
        {hover && (
          <div className="absolute top-4 left-4 glass rounded-lg p-3 text-xs" style={{ fontFamily: "monospace" }}>
            <div className="text-cyan text-sm font-semibold" style={{ fontFamily: "Orbitron" }}>{hover.name}</div>
            <div className="mt-1 opacity-70">Threats: {Math.floor(Math.random() * 400) + 20}</div>
            <div className="opacity-70">Top: {randAttack()}</div>
            <div className="opacity-70">Risk: {(Math.random() * 10).toFixed(1)}</div>
          </div>
        )}
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {COUNTRIES.slice(0, 5).map((c) => (
          <div key={c.code} className="rounded-lg border border-cyan/20 p-2 text-xs">
            <div className="text-cyan text-[10px] uppercase tracking-widest">{c.name}</div>
            <div className="text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>{Math.floor(Math.random() * 500)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Prediction Engine ----------
function PredictionEngine() {
  const stages = ["Dataset", "Preprocessing", "Feature Engineering", "Random Forest", "Prediction", "Alert"];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-6">
        {stages.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-xl p-4 text-center relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-electric/20 opacity-0"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            <div className="relative">
              <div className="text-3xl font-light text-cyan text-glow" style={{ fontFamily: "Orbitron" }}>0{i + 1}</div>
              <div className="mt-2 text-xs uppercase tracking-widest">{s}</div>
              <div className="mt-2 h-1 rounded bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan"
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Confidence stream (last 30s)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={Array.from({ length: 30 }, (_, i) => ({ t: i, v: 70 + Math.random() * 29 }))}>
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38dcff" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#38dcff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis {...axis} dataKey="t" />
            <YAxis {...axis} domain={[60, 100]} />
            <Area type="monotone" dataKey="v" stroke="#38dcff" fill="url(#areaG)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Model Performance ----------
function ModelPerformance() {
  const stats = [
    { label: "Accuracy", value: 98.4 },
    { label: "Precision", value: 97.1 },
    { label: "Recall", value: 96.8 },
    { label: "F1 Score", value: 97.0 },
    { label: "ROC-AUC", value: 99.2 },
  ];
  const matrix = [
    [4820, 32, 8, 0],
    [21, 3105, 15, 2],
    [4, 12, 2891, 9],
    [1, 0, 6, 1502],
  ];
  const labels = ["Benign", "DDoS", "PortScan", "Malware"];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Confusion Matrix</div>
        <div className="grid grid-cols-5 gap-1 text-xs font-mono">
          <div />
          {labels.map((l) => <div key={l} className="text-center text-cyan">{l}</div>)}
          {matrix.map((row, i) => (
            <div key={i} className="contents">
              <div className="text-cyan text-right pr-2">{labels[i]}</div>
              {row.map((v, j) => {
                const max = Math.max(...matrix.flat());
                const intensity = v / max;
                return (
                  <div
                    key={j}
                    className="aspect-square rounded flex items-center justify-center border border-cyan/20"
                    style={{ background: `rgba(56,220,255,${intensity * 0.7})` }}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Metrics</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={stats}>
            <PolarGrid stroke="rgba(56,220,255,0.2)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "rgba(200,220,255,0.7)", fontSize: 10 }} />
            <Radar dataKey="value" stroke="#38dcff" fill="#38dcff" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[9px] uppercase text-muted-foreground">{s.label}</div>
              <div className="text-cyan text-sm font-mono">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-4 md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">ROC Curve</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={Array.from({ length: 20 }, (_, i) => ({ x: i / 19, y: Math.pow(i / 19, 0.35) }))}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis {...axis} dataKey="x" />
            <YAxis {...axis} />
            <Line dataKey="y" stroke="#38dcff" strokeWidth={2} dot={false} />
            <Line data={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} dataKey="y" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Future AI ----------
function FutureAI() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric/10 via-transparent to-cyan/10 animate-pulse" />
        <div className="relative grid md:grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Current</div>
            <div className="text-2xl font-light text-cyan text-glow" style={{ fontFamily: "Orbitron" }}>Random Forest</div>
            <div className="mt-2 text-xs opacity-70">98.4% acc · 47M params</div>
          </div>
          <div className="flex justify-center">
            <motion.div animate={{ x: [0, 20, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
              <div className="text-4xl text-electric">⟶</div>
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Future</div>
            <div className="text-2xl font-light text-electric text-glow" style={{ fontFamily: "Orbitron" }}>CTGAN Hybrid</div>
            <div className="mt-2 text-xs opacity-70">synthetic dataset augmentation</div>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Synthetic attack generation</div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0.6], scale: 1 }}
              transition={{ duration: 2, delay: i * 0.08, repeat: Infinity, repeatDelay: 3 }}
              className="aspect-square rounded border border-electric/40 bg-electric/10 flex items-center justify-center text-[9px] font-mono text-electric"
            >
              {randAttack().slice(0, 3).toUpperCase()}
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          → merging synthetic samples into training pipeline · +2.7% recall expected
        </div>
      </div>
    </div>
  );
}

// ---------- Logs ----------
function Logs() {
  const [q, setQ] = useState("");
  const rows = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      time: `2026-07-23 ${String(10 + Math.floor(i / 6)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      sev: randSeverity(),
      src: randIP(),
      event: randAttack(),
      msg: `Detected anomalous behavior on port ${Math.floor(Math.random() * 9000)}`,
    })),
  []);
  const filtered = rows.filter((r) => (q ? [r.event, r.src, r.msg].join(" ").toLowerCase().includes(q.toLowerCase()) : true));
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search logs..."
          className="flex-1 glass rounded-lg px-3 py-2 text-sm outline-none border border-cyan/20 focus:border-cyan/60"
        />
        <button className="glass rounded-lg px-3 py-2 text-xs border border-cyan/30 hover:bg-cyan/10 transition">Export CSV</button>
        <button className="glass rounded-lg px-3 py-2 text-xs border border-cyan/30 hover:bg-cyan/10 transition">Download</button>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[180px_90px_130px_130px_1fr] gap-2 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/10">
          <div>Time</div><div>Severity</div><div>Source</div><div>Event</div><div>Message</div>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {filtered.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-[180px_90px_130px_130px_1fr] gap-2 px-4 py-2 text-xs font-mono border-b border-white/5 hover:bg-cyan/5"
            >
              <span className="text-muted-foreground">{r.time}</span>
              <span className={`px-2 rounded border text-[10px] uppercase ${severityBg(r.sev)}`}>{r.sev}</span>
              <span>{r.src}</span>
              <span className="text-cyan">{r.event}</span>
              <span className="text-foreground/70 truncate">{r.msg}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Alerts ----------
function Alerts() {
  const alerts = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i, name: randAttack(), sev: randSeverity(), when: `${i * 3 + 1}m ago`, src: randIP(),
  })), []);
  return (
    <div className="space-y-3">
      {alerts.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`glass rounded-xl p-4 border-l-4 flex items-center justify-between ${severityBg(a.sev)}`}
        >
          <div>
            <div className="text-xs uppercase tracking-widest opacity-70">{a.when}</div>
            <div className="text-lg font-semibold" style={{ fontFamily: "Orbitron" }}>{a.name}</div>
            <div className="text-xs font-mono opacity-70">from {a.src}</div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded border border-current">Investigate</button>
            <button className="text-xs px-3 py-1 rounded border border-current">Quarantine</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Reports ----------
function Reports() {
  const cards = [
    { title: "Daily Threat Summary", when: "Today, 08:00", n: 342 },
    { title: "Weekly Incident Report", when: "This week", n: 1893 },
    { title: "Monthly Executive Brief", when: "July 2026", n: 8734 },
    { title: "Compliance Report", when: "Q3 2026", n: 27 },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cards.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          className="glass rounded-xl p-5 border border-cyan/20 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan/10 to-electric/10" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.when}</div>
            <div className="text-xl font-light mt-1" style={{ fontFamily: "Orbitron" }}>{c.title}</div>
            <div className="text-4xl mt-3 text-cyan text-glow font-light" style={{ fontFamily: "Orbitron" }}>{c.n.toLocaleString()}</div>
            <div className="text-xs opacity-60">events analyzed</div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1.5 rounded text-xs border border-cyan/40 hover:bg-cyan/10 transition">Download PDF</button>
              <button className="px-3 py-1.5 rounded text-xs border border-cyan/40 hover:bg-cyan/10 transition">Download CSV</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Analytics ----------
function Analytics() {
  const traffic = Array.from({ length: 24 }, (_, i) => ({ h: `${i}h`, in: Math.random() * 100 + 50, out: Math.random() * 80 + 30 }));
  const types = ATTACK_TYPES.slice(0, 8).map((t) => ({ name: t, v: Math.floor(Math.random() * 500) + 20 }));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Traffic (24h)</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={traffic}>
            <defs>
              <linearGradient id="inG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38dcff" stopOpacity={0.8} /><stop offset="100%" stopColor="#38dcff" stopOpacity={0} /></linearGradient>
              <linearGradient id="outG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7d7dff" stopOpacity={0.8} /><stop offset="100%" stopColor="#7d7dff" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis {...axis} dataKey="h" />
            <YAxis {...axis} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(56,220,255,0.3)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="in" stroke="#38dcff" fill="url(#inG)" />
            <Area type="monotone" dataKey="out" stroke="#7d7dff" fill="url(#outG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Attack types</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={types}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis {...axis} dataKey="name" />
            <YAxis {...axis} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(56,220,255,0.3)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {types.map((_, i) => <Cell key={i} fill={`hsl(${190 + i * 8}, 90%, 60%)`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass rounded-xl p-4 md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Threat heatmap (weekly)</div>
        <div className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0,1fr))" }}>
          {Array.from({ length: 24 * 7 }).map((_, i) => {
            const v = Math.random();
            return <div key={i} className="aspect-square rounded" style={{ background: `rgba(56,220,255,${v * 0.9})` }} />;
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Traffic Monitor ----------
function TrafficMonitor() {
  const [data, setData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, v: 50 + Math.random() * 80 })));
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => [...d.slice(1), { t: d[d.length - 1].t + 1, v: 40 + Math.random() * 100 }]);
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Realtime throughput</div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38dcff" stopOpacity={0.7} /><stop offset="100%" stopColor="#38dcff" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis {...axis} dataKey="t" />
          <YAxis {...axis} />
          <Area dataKey="v" stroke="#38dcff" fill="url(#rt)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- AI Health ----------
function AIHealth() {
  const metrics = [
    { l: "GPU Load", v: 72 },
    { l: "Inference Latency", v: 12 },
    { l: "Queue Depth", v: 3 },
    { l: "Model Drift", v: 0.4 },
    { l: "Uptime (days)", v: 47 },
    { l: "Requests/min", v: 8420 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.l} className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
          <div className="text-3xl font-light text-cyan text-glow mt-1" style={{ fontFamily: "Orbitron" }}>{m.v}</div>
          <div className="mt-2 h-1 rounded bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-cyan" initial={{ width: 0 }} animate={{ width: `${Math.min(100, m.v)}%` }} transition={{ duration: 1.2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
