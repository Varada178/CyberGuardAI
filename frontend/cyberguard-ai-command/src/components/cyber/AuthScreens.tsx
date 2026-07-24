import { motion } from "motion/react";
import { useEffect } from "react";
import { useState } from "react";
import { Mail, Lock, User, Building2, Shield, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";

function Frame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(20px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
    >
      <div className="pointer-events-none absolute inset-0 cyber-grid opacity-40" />
      <div className="relative w-full max-w-md">
        {/* holographic border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan/60 via-transparent to-fuchsia-500/40 opacity-70 blur-[2px]" />
        <div className="absolute -inset-[1px] rounded-2xl border border-cyan/40" />
        <div className="relative glass rounded-2xl p-7 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{
            background: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,255,255,0.04) 2px 3px)",
          }} />
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg border border-cyan/40 flex items-center justify-center bg-cyan/10">
                <div className="absolute inset-0 rounded-lg border border-cyan/30 animate-spin-slow" />
                <span className="text-cyan text-glow" style={{ fontFamily: "Orbitron" }}>C</span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Classified Access</div>
                <div className="text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>
                  CYBERGUARD <span className="text-cyan">AI</span>
                </div>
              </div>
            </div>
            <div className="mt-5 text-xl font-light" style={{ fontFamily: "Orbitron" }}>{title}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{subtitle}</div>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  icon: Icon, type = "text", placeholder, value, onChange,
}: { icon: any; type?: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="group flex items-center gap-2 rounded-md border border-cyan/20 bg-black/30 px-3 py-2 focus-within:border-cyan/60 transition-colors">
      <Icon className="h-4 w-4 text-cyan/70" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground/60"
      />
    </label>
  );
}

export function LoginScreen({
  onLogin, onSignup,
}: { onLogin: () => void; onSignup: () => void }) {
  const [email, setEmail] = useState("alex@cyberguard.ai");
  const [password, setPassword] = useState("••••••••");
  const [remember, setRemember] = useState(true);

  return (
    <Frame title="Operator Sign-In" subtitle="Authenticate to access the SOC">
      <form
        onSubmit={(e) => { e.preventDefault(); onLogin(); }}
        className="space-y-3"
      >
        <Field icon={Mail} type="email" placeholder="operator@domain" value={email} onChange={setEmail} />
        <Field icon={Lock} type="password" placeholder="passphrase" value={password} onChange={setPassword} />
        <div className="flex items-center justify-between text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-cyan" />
            <span className="text-muted-foreground">Remember this terminal</span>
          </label>
          <button type="button" className="text-cyan/80 hover:text-cyan">Recover Key</button>
        </div>

        <button
          type="submit"
          className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-2.5 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition"
          style={{ fontFamily: "Orbitron" }}
        >
          <KeyRound className="h-4 w-4" /> Login
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
        </button>
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-md border border-cyan/20 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-cyan hover:border-cyan/40 font-mono transition"
        >
          Continue Demo
        </button>

        <div className="pt-3 text-center text-xs font-mono text-muted-foreground">
          Don't have an account?{" "}
          <button type="button" onClick={onSignup} className="text-cyan hover:text-glow">Create Account</button>
        </div>
      </form>
    </Frame>
  );
}

export function SignupScreen({ onCreated, onBack }: { onCreated: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [role, setRole] = useState("Security Analyst");

  return (
    <Frame title="Register Operator" subtitle="Provision a new SOC identity">
      <form
        onSubmit={(e) => { e.preventDefault(); onCreated(); }}
        className="space-y-3"
      >
        <Field icon={User} placeholder="Full Name" value={name} onChange={setName} />
        <Field icon={Building2} placeholder="Organization" value={org} onChange={setOrg} />
        <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} />
        <div className="grid grid-cols-2 gap-3">
          <Field icon={Lock} type="password" placeholder="Password" value={pw} onChange={setPw} />
          <Field icon={Lock} type="password" placeholder="Confirm" value={pw2} onChange={setPw2} />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-cyan/20 bg-black/30 px-3 py-2">
          <Shield className="h-4 w-4 text-cyan/70" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-transparent text-sm font-mono outline-none"
          >
            <option className="bg-[#06070A]">Administrator</option>
            <option className="bg-[#06070A]">Security Analyst</option>
          </select>
        </label>

        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-2.5 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition"
          style={{ fontFamily: "Orbitron" }}
        >
          Create Account <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan/20 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-cyan hover:border-cyan/40 font-mono transition"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Login
        </button>
      </form>
    </Frame>
  );
}

const VERIFY_STEPS = [
  "Identity Verified",
  "Loading User Profile",
  "Decrypting Intelligence",
  "Access Granted",
  "Welcome Back, Operator",
];

export function AIVerification({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => {
        if (prev >= VERIFY_STEPS.length - 1) {
          clearInterval(id);
          setTimeout(onDone, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 420);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg px-6">
        <div className="text-center mb-8">
          <div className="text-[10px] uppercase tracking-[0.6em] text-cyan/80">Neural Authentication</div>
          <div className="mt-2 text-2xl font-light text-glow" style={{ fontFamily: "Orbitron" }}>
            SECURING SESSION
          </div>
        </div>
        <div className="space-y-2 font-mono text-sm">
          {VERIFY_STEPS.map((s, idx) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: idx <= i ? 1 : 0.2, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 rounded border border-cyan/15 bg-black/30 px-3 py-2 ${idx <= i ? "text-safe" : "text-muted-foreground"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${idx <= i ? "bg-safe animate-pulse" : "bg-muted"}`} />
              {s}
              {idx === i && <span className="ml-auto text-cyan animate-pulse">●</span>}
            </motion.div>
          ))}
        </div>
        <div className="mt-8 h-[2px] w-full overflow-hidden rounded bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan via-fuchsia-500 to-cyan"
            initial={{ width: "0%" }}
            animate={{ width: `${((i + 1) / VERIFY_STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
