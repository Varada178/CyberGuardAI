import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bell, User, X, LogOut, Settings, Palette, ShieldCheck, Edit3,
  Activity, Target, TrendingUp, CheckCircle2, AlertTriangle, Info, Cpu,
} from "lucide-react";

type Notif = { id: number; icon: any; title: string; time: string; tone: "info" | "warn" | "safe" };

const NOTIFS: Notif[] = [
  { id: 1, icon: AlertTriangle, title: "Port Scan detected · 172.24.9.14", time: "2m ago", tone: "warn" },
  { id: 2, icon: Info, title: "New Threat Intelligence Update", time: "18m ago", tone: "info" },
  { id: 3, icon: Cpu, title: "Model successfully updated · v4.2.1", time: "1h ago", tone: "info" },
  { id: 4, icon: CheckCircle2, title: "System Running Normally", time: "2h ago", tone: "safe" },
];

export function TopBarActions({ onLogout }: { onLogout: () => void }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenProfile(false); setOpenNotif(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => { setOpenNotif((v) => !v); setOpenProfile(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-cyan/30 bg-black/40 hover:border-cyan/60 transition"
          >
            <Bell className="h-4 w-4 text-cyan" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-mono text-white">
              {NOTIFS.length}
            </span>
          </button>
          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-cyan/30 glass p-3 shadow-2xl"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Alerts</div>
                  <button onClick={() => setOpenNotif(false)}><X className="h-3.5 w-3.5 text-muted-foreground hover:text-cyan" /></button>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {NOTIFS.map((n) => {
                    const Icon = n.icon;
                    const tone = n.tone === "warn" ? "text-warn border-warn/30" : n.tone === "safe" ? "text-safe border-safe/30" : "text-cyan border-cyan/30";
                    return (
                      <div key={n.id} className={`flex items-start gap-2.5 rounded-md border bg-black/40 p-2.5 ${tone}`}>
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono text-foreground/90 truncate">{n.title}</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => { setOpenProfile(true); setOpenNotif(false); }}
          className="relative h-9 w-9 rounded-full border-2 border-cyan/50 bg-cyan/10 flex items-center justify-center hover:border-cyan transition"
        >
          <span className="absolute inset-0 rounded-full border border-cyan/40 animate-spin-slow" />
          <span className="text-cyan font-mono text-xs">AJ</span>
        </button>
      </div>

      <ProfileDrawer open={openProfile} onClose={() => setOpenProfile(false)} onLogout={onLogout} />
    </>
  );
}

function ProfileDrawer({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-cyan/30 glass"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan/10 to-transparent" />
            <div className="relative p-5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Operator Profile</div>
                <button onClick={onClose} className="rounded-md border border-cyan/20 p-1.5 hover:border-cyan/60">
                  <X className="h-4 w-4 text-cyan" />
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full border-2 border-cyan/50 bg-cyan/10 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-cyan/40 animate-spin-slow" />
                  <span className="text-cyan font-mono text-lg">AJ</span>
                </div>
                <div>
                  <div className="text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>Alex Johnson</div>
                  <div className="text-xs font-mono text-cyan">Security Analyst</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">CyberGuard Labs</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-mono">
                <InfoRow label="Email" value="alex@cyberguard.ai" />
                <InfoRow label="Member Since" value="January 2026" />
                <InfoRow label="Clearance" value="SEC LVL · 5" />
                <InfoRow label="Session" value="ACTIVE" tone="safe" />
              </div>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Quick Stats</div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon={Target} label="Threats" value="1,452" />
                  <StatCard icon={Activity} label="Analyses" value="18,540" />
                  <StatCard icon={TrendingUp} label="Accuracy" value="98.7%" />
                </div>
              </div>

              <div className="mt-6 space-y-1.5">
                <ActionRow icon={Edit3} label="Edit Profile" />
                <ActionRow icon={Bell} label="Notification Settings" />
                <ActionRow icon={Palette} label="Appearance" />
                <ActionRow icon={ShieldCheck} label="Security Settings" />
                <ActionRow icon={Settings} label="Preferences" />
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm font-mono text-danger hover:bg-danger/20 transition"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: "safe" }) {
  return (
    <div className="rounded border border-cyan/15 bg-black/30 p-2">
      <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-0.5 truncate ${tone === "safe" ? "text-safe" : "text-foreground/90"}`}>{value}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded border border-cyan/20 bg-black/30 p-2.5 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-cyan" />
      <div className="mt-1 text-sm font-mono text-cyan text-glow">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function ActionRow({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-md border border-cyan/15 bg-black/30 px-3 py-2.5 text-sm font-mono text-foreground/90 hover:border-cyan/40 hover:text-cyan transition">
      <Icon className="h-4 w-4 text-cyan/80" />
      {label}
    </button>
  );
}
