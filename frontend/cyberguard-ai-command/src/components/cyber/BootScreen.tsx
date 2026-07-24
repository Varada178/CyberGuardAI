import { motion } from "motion/react";
import { useEffect, useState } from "react";

const STAGES = [
  "Loading AI Core",
  "Loading Threat Engine",
  "Loading Intelligence Database",
  "Loading Neural Network",
  "Initializing Security Matrix",
  "Establishing Secure Uplink",
];

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 4200;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      const idx = Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length));
      setStageIndex(idx);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(onComplete, 600);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onComplete]);

  useEffect(() => {
    const msgs = [
      "> initializing kernel modules...",
      "> mounting /dev/threat-intel",
      "> loading ml/random_forest.bin [98.4% acc]",
      "> handshake TLS 1.3 established",
      "> connecting to global sensor grid",
      "> 12,847 nodes online",
      "> syncing IOC feed (last 24h)",
      "> 3,241 signatures loaded",
      "> neural weights: 47.3M parameters ready",
      "> firewall matrix armed",
      "> boot sequence complete",
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i >= msgs.length) return clearInterval(id);
      setLogs((l) => [...l, msgs[i]]);
      i++;
    }, 380);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 0.7 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06070A] cyber-grid animate-grid-drift overflow-hidden"
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,220,255,0.15),transparent_60%)]" />
      {/* Scan line */}
      <div className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan/20 to-transparent animate-scan-line" />

      <div className="relative w-full max-w-3xl px-6 sm:px-10">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-cyan/20 blur-3xl" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan/40 neon-border">
              <div className="absolute inset-2 rounded-full border border-cyan/30 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-electric/40 animate-spin-slower" />
              <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-cyan">
                <path
                  d="M12 2L3 6v6c0 5 3.8 9.5 9 10 5.2-.5 9-5 9-10V6l-9-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-4xl sm:text-5xl font-light tracking-[0.35em] text-glow"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            CYBERGUARD <span className="text-cyan">AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-2 text-xs tracking-[0.5em] text-muted-foreground uppercase"
          >
            Autonomous Cyber Defense Platform · v4.2.1
          </motion.p>
        </div>

        {/* Progress */}
        <div className="mt-12">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="text-cyan">{STAGES[stageIndex]}...</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan via-electric to-cyan animate-shine"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {STAGES.map((s, i) => (
              <span
                key={s}
                className={`text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded ${
                  i <= stageIndex
                    ? "text-cyan border border-cyan/40 bg-cyan/5"
                    : "text-muted-foreground/40 border border-white/5"
                }`}
              >
                {i <= stageIndex ? "✓" : "○"} {s.replace("Loading ", "").replace("Initializing ", "")}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="mt-8 h-40 overflow-hidden rounded-lg glass p-4 font-mono text-xs">
          {logs.filter(Boolean).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={
                log.includes("complete") || log.includes("online") || log.includes("armed")
                  ? "text-safe"
                  : "text-cyan/80"
              }
            >
              {log}
            </motion.div>
          ))}

          <span className="text-cyan animate-blink">█</span>
        </div>
      </div>
    </motion.div>
  );
}
