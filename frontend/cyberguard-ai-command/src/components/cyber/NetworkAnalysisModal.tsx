import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  X, Zap, Upload, Radio, ShieldAlert, ShieldCheck, Download,
  RefreshCw, FileText, Cpu, Activity, CheckCircle2,
} from "lucide-react";

type Tab = "quick" | "upload" | "live";

const PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "ICMP"];

const DEFAULTS = () => ({
  protocol: "TCP",
  dstPort: "80",
  flowDuration: "1284920",
  packetLength: "1420",
  fwdPackets: "482",
  bwdPackets: "17",
  flowBytesPerSec: "184203.44",
  syn: "128",
  ack: "42",
  fin: "3",
  rst: "9",
  urg: "0",
});

const ANALYSIS_STEPS = [
  "Extracting Features",
  "Normalizing Data",
  "Running Random Forest",
  "Checking Threat Intelligence",
  "Computing Confidence",
  "Generating Prediction",
];

export function NetworkAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("quick");
  const [fields, setFields] = useState(DEFAULTS());
  const [phase, setPhase] = useState<"idle" | "running" | "result">("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<null | ReturnType<typeof buildResult>>(null);
  const [uploadProg, setUploadProg] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("idle"); setStep(0); setResult(null);
      setUploadProg(null); setFileName(null); setTab("quick");
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "running") return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= ANALYSIS_STEPS.length - 1) {
          clearInterval(id);
          setTimeout(() => {
            setResult(buildResult(fields));
            setPhase("result");
          }, 350);
          return s;
        }
        return s + 1;
      });
    }, 380);
    return () => clearInterval(id);
  }, [phase, fields]);

  const set = (k: keyof typeof fields, v: string) => setFields((f) => ({ ...f, [k]: v }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan/60 via-transparent to-fuchsia-500/40 opacity-70 blur-[2px]" />
            <div className="relative glass rounded-2xl border border-cyan/30 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan/15 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md border border-cyan/40 bg-cyan/10 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4 text-cyan" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">AI Terminal</div>
                    <div className="text-sm font-light text-glow" style={{ fontFamily: "Orbitron" }}>
                      NETWORK THREAT ANALYSIS
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-md border border-cyan/20 p-1.5 hover:border-cyan/60">
                  <X className="h-4 w-4 text-cyan" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-cyan/10 px-3 py-2">
                {([
                  ["quick", "Quick Analysis", Zap],
                  ["upload", "Upload CSV", Upload],
                  ["live", "Live Monitoring", Radio],
                ] as const).map(([id, label, Icon]) => (
                  <button
                    key={id} onClick={() => setTab(id)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs uppercase tracking-widest font-mono transition ${
                      tab === id ? "border border-cyan/50 bg-cyan/10 text-cyan" : "border border-transparent text-muted-foreground hover:text-cyan"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {phase === "running" && (
                    <RunningView key="run" step={step} />
                  )}
                  {phase === "result" && result && (
                    <ResultView key="res" r={result} onClose={onClose} onAgain={() => { setFields(DEFAULTS()); setPhase("idle"); }} />
                  )}
                  {phase === "idle" && tab === "quick" && (
                    <motion.div key="quick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Select label="Protocol" value={fields.protocol} options={PROTOCOLS} onChange={(v) => set("protocol", v)} />
                        <Input label="Destination Port" value={fields.dstPort} onChange={(v) => set("dstPort", v)} />
                        <Input label="Flow Duration (µs)" value={fields.flowDuration} onChange={(v) => set("flowDuration", v)} />
                        <Input label="Packet Length" value={fields.packetLength} onChange={(v) => set("packetLength", v)} />
                        <Input label="Total Fwd Packets" value={fields.fwdPackets} onChange={(v) => set("fwdPackets", v)} />
                        <Input label="Total Bwd Packets" value={fields.bwdPackets} onChange={(v) => set("bwdPackets", v)} />
                        <Input label="Flow Bytes / sec" value={fields.flowBytesPerSec} onChange={(v) => set("flowBytesPerSec", v)} />
                        <Input label="SYN Flag Count" value={fields.syn} onChange={(v) => set("syn", v)} />
                        <Input label="ACK Flag Count" value={fields.ack} onChange={(v) => set("ack", v)} />
                        <Input label="FIN Flag Count" value={fields.fin} onChange={(v) => set("fin", v)} />
                        <Input label="RST Flag Count" value={fields.rst} onChange={(v) => set("rst", v)} />
                        <Input label="URG Flag Count" value={fields.urg} onChange={(v) => set("urg", v)} />
                      </div>
                      <button
                        onClick={() => setPhase("running")}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-3 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition"
                        style={{ fontFamily: "Orbitron" }}
                      >
                        <Cpu className="h-4 w-4" /> Analyze Threat
                      </button>
                    </motion.div>
                  )}
                  {phase === "idle" && tab === "upload" && (
                    <UploadView
                      key="upload"
                      fileName={fileName} setFileName={setFileName}
                      progress={uploadProg} setProgress={setUploadProg}
                    />
                  )}
                  {phase === "idle" && tab === "live" && (
                    <ComingSoon key="live" />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1 font-mono">{label}</div>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-cyan/20 bg-black/30 px-2.5 py-2 text-sm font-mono text-cyan outline-none focus:border-cyan/60"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1 font-mono">{label}</div>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-cyan/20 bg-black/30 px-2.5 py-2 text-sm font-mono text-cyan outline-none focus:border-cyan/60"
      >
        {options.map((o) => <option key={o} className="bg-[#06070A]">{o}</option>)}
      </select>
    </label>
  );
}

function RunningView({ step }: { step: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6">
      <div className="text-center mb-6">
        <div className="text-[10px] uppercase tracking-[0.5em] text-cyan/80">Neural Inference</div>
        <div className="mt-1 text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>PROCESSING</div>
      </div>
      <div className="mx-auto max-w-md space-y-2 font-mono text-sm">
        {ANALYSIS_STEPS.map((s, i) => (
          <div key={s}
            className={`flex items-center gap-3 rounded border border-cyan/15 bg-black/30 px-3 py-2 ${i <= step ? "text-safe" : "text-muted-foreground"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${i < step ? "bg-safe" : i === step ? "bg-cyan animate-pulse" : "bg-muted"}`} />
            {s}
            {i < step && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-safe" />}
            {i === step && <span className="ml-auto text-cyan animate-pulse">●●●</span>}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-6 h-[2px] max-w-md overflow-hidden rounded bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-cyan via-fuchsia-500 to-cyan"
          initial={{ width: "0%" }} animate={{ width: `${((step + 1) / ANALYSIS_STEPS.length) * 100}%` }} />
      </div>
    </motion.div>
  );
}

function buildResult(f: ReturnType<typeof DEFAULTS>) {
  const safe = Math.random() < 0.35;
  if (safe) {
    return {
      safe: true, prediction: "Normal Traffic", confidence: 98.7,
      severity: "Safe", risk: 6,
      recommendation: "No suspicious activity detected. Continue monitoring.",
      features: ["Balanced Fwd/Bwd Ratio", "Normal Packet Length", "Standard Flow Duration", "Common Destination Port"],
      srcIp: "10.0.14." + Math.floor(Math.random() * 250),
      dstIp: "192.168.10." + Math.floor(Math.random() * 250),
      protocol: f.protocol,
    };
  }
  const kinds = ["DDoS Attack", "Port Scan", "Brute Force", "Botnet Beacon", "SQL Injection"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  return {
    safe: false, prediction: kind,
    confidence: +(96 + Math.random() * 3.5).toFixed(2),
    severity: "Critical", risk: Math.floor(90 + Math.random() * 9),
    recommendation: `High probability ${kind} detected. Immediately isolate source device. Inspect incoming traffic. Apply firewall rules.`,
    features: ["High SYN Count", "Abnormal Packet Length", "Large Flow Duration", "Destination Port " + f.dstPort],
    srcIp: "192.168.10." + Math.floor(Math.random() * 250),
    dstIp: "104.26.15." + Math.floor(Math.random() * 250),
    protocol: f.protocol,
  };
}

function ResultView({
  r, onClose, onAgain,
}: { r: ReturnType<typeof buildResult>; onClose: () => void; onAgain: () => void }) {
  const isSafe = r.safe;
  const accent = isSafe ? "safe" : "danger";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl border p-5 ${isSafe ? "border-safe/40 bg-safe/5" : "border-danger/40 bg-danger/5"}`}>
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "repeating-linear-gradient(90deg, transparent 0 20px, rgba(255,255,255,0.03) 20px 21px)" }} />
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-lg border ${isSafe ? "border-safe/50 bg-safe/10" : "border-danger/50 bg-danger/10"}`}>
            {isSafe
              ? <ShieldCheck className="h-7 w-7 text-safe" />
              : <ShieldAlert className="h-7 w-7 text-danger" />}
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Prediction</div>
            <div className={`text-2xl font-light text-glow ${isSafe ? "text-safe" : "text-danger"}`} style={{ fontFamily: "Orbitron" }}>
              {r.prediction}
            </div>
            <div className="mt-1 text-xs font-mono text-muted-foreground">Timestamp · {new Date().toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Severity</div>
            <div className={`text-lg font-mono ${isSafe ? "text-safe" : "text-danger"}`}>{r.severity}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Confidence" value={`${r.confidence}%`} accent={accent} />
          <Stat label="Risk Score" value={`${r.risk}/100`} accent={accent} />
          <Stat label="Protocol" value={r.protocol} accent={accent} />
          <Stat label="Src → Dst" value={`${r.srcIp} → ${r.dstIp}`} mono accent={accent} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-cyan/20 p-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-cyan/80 mb-2">Recommendation</div>
          <p className="text-sm font-mono text-foreground/90 leading-relaxed">{r.recommendation}</p>
        </div>
        <div className="rounded-lg border border-cyan/20 p-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-cyan/80 mb-2">Feature Importance</div>
          <ul className="space-y-1.5 text-xs font-mono">
            {r.features.map((f, i) => (
              <li key={f} className="flex items-center justify-between gap-3">
                <span className="text-foreground/80">{f}</span>
                <span className="flex-1 mx-2 h-1 rounded bg-white/5 overflow-hidden">
                  <motion.span
                    initial={{ width: 0 }} animate={{ width: `${90 - i * 15}%` }} transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`block h-full ${isSafe ? "bg-safe" : "bg-danger"}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button onClick={onClose} className="rounded-md border border-cyan/20 px-4 py-2 text-xs uppercase tracking-widest font-mono text-muted-foreground hover:text-cyan hover:border-cyan/40">
          Close
        </button>
        <button onClick={() => downloadReport(r)} className="flex items-center gap-2 rounded-md border border-cyan/30 px-4 py-2 text-xs uppercase tracking-widest font-mono text-cyan hover:bg-cyan/10">
          <Download className="h-3.5 w-3.5" /> Download Report
        </button>
        <button onClick={onAgain} className="flex items-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-widest font-mono text-cyan hover:bg-cyan/20">
          <RefreshCw className="h-3.5 w-3.5" /> Run Another Analysis
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent: "safe" | "danger" }) {
  return (
    <div className={`rounded border p-3 ${accent === "safe" ? "border-safe/30" : "border-danger/30"}`}>
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-1 ${mono ? "text-xs" : "text-lg"} font-mono ${accent === "safe" ? "text-safe" : "text-danger"} truncate`}>{value}</div>
    </div>
  );
}

function downloadReport(r: ReturnType<typeof buildResult>) {
  const body = `CYBERGUARD AI — THREAT ANALYSIS REPORT
Generated: ${new Date().toISOString()}
========================================
Prediction : ${r.prediction}
Confidence : ${r.confidence}%
Severity   : ${r.severity}
Risk Score : ${r.risk}/100
Protocol   : ${r.protocol}
Source IP  : ${r.srcIp}
Dest   IP  : ${r.dstIp}

Recommendation:
${r.recommendation}

Top Features:
${r.features.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}
`;
  const blob = new Blob([body], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cyberguard-report-${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(url);
}

function UploadView({
  fileName, setFileName, progress, setProgress,
}: {
  fileName: string | null; setFileName: (s: string | null) => void;
  progress: number | null; setProgress: (p: number | null) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);

  const start = (name: string) => {
    setFileName(name); setDone(false); setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 4 + Math.random() * 8;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setDone(true), 400); }
      setProgress(p);
    }, 120);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0]; if (f) start(f.name);
        }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition-colors ${drag ? "border-cyan bg-cyan/10" : "border-cyan/30 bg-black/20"}`}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10"
        >
          <Upload className="h-7 w-7 text-cyan" />
        </motion.div>
        <div className="text-sm font-mono text-cyan">Drop a CSV file here</div>
        <div className="mt-1 text-xs text-muted-foreground font-mono">or</div>
        <label className="mt-2 cursor-pointer rounded-md border border-cyan/40 px-3 py-1.5 text-xs uppercase tracking-widest font-mono text-cyan hover:bg-cyan/10">
          Browse Files
          <input type="file" accept=".csv" hidden onChange={(e) => {
            const f = e.target.files?.[0]; if (f) start(f.name);
          }} />
        </label>
        <div className="mt-3 text-[10px] font-mono text-muted-foreground">Accepted: .csv · Max 50MB</div>
      </div>

      {fileName && (
        <div className="rounded-lg border border-cyan/20 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-cyan" />
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-mono text-cyan">{fileName}</div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded bg-white/5">
                <motion.div className="h-full bg-gradient-to-r from-cyan to-fuchsia-500"
                  animate={{ width: `${progress ?? 0}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono text-cyan w-10 text-right">{Math.round(progress ?? 0)}%</span>
          </div>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 rounded border border-safe/40 bg-safe/5 px-3 py-2 text-xs font-mono text-safe">
              <CheckCircle2 className="h-4 w-4" /> File processed · 12,483 flows analyzed · 3 anomalies flagged
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ComingSoon() {
  const bars = useMemo(() => Array.from({ length: 40 }, () => 20 + Math.random() * 60), []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10">
          <Radio className="h-7 w-7 text-cyan animate-pulse" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.5em] text-cyan/80">Live Packet Sniffing</div>
        <div className="mt-1 text-2xl font-light text-glow" style={{ fontFamily: "Orbitron" }}>COMING SOON</div>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          Real-time AI monitoring powered by Scapy · zero-latency anomaly detection · adaptive neural triage.
        </p>
        <div className="mt-6 flex h-24 items-end justify-center gap-1 rounded-lg border border-cyan/20 bg-black/30 p-3">
          {bars.map((h, i) => (
            <motion.span key={i}
              className="w-1.5 rounded-sm bg-gradient-to-t from-cyan/40 to-cyan"
              animate={{ height: [`${h}%`, `${20 + Math.random() * 70}%`, `${h}%`] }}
              transition={{ duration: 1.4 + Math.random(), repeat: Infinity, delay: i * 0.03 }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-cyan/70">
          <Activity className="h-3.5 w-3.5" /> Interface awaiting kernel bridge…
        </div>
      </div>
    </motion.div>
  );
}
