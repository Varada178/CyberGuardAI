import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bell, X, LogOut, Edit3, Activity, Target, TrendingUp,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import type { UserProfile } from "@/lib/auth-api";

export function TopBarActions({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const { alerts } = useDashboard();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const initials = user ? getInitials(user) : "OP";

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
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-mono text-white">
                {alerts.length}
              </span>
            )}
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
                  {alerts.length === 0 && (
                    <div className="text-xs font-mono text-muted-foreground p-2">No attack alerts yet.</div>
                  )}
                  {alerts.map((n) => (
                    <div key={n.id} className="flex items-start gap-2.5 rounded-md border border-warn/30 bg-black/40 p-2.5 text-warn">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-foreground/90">{n.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {new Date(n.created_at).toLocaleString()} · {n.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
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
          <span className="text-cyan font-mono text-xs">{initials}</span>
        </button>
      </div>

      <ProfileDrawer open={openProfile} onClose={() => setOpenProfile(false)} onLogout={onLogout} user={user} />
    </>
  );
}

function ProfileDrawer({
  open, onClose, onLogout, user,
}: {
  open: boolean; onClose: () => void; onLogout: () => void; user: UserProfile | null;
}) {
  const { saveProfile, logout } = useAuth();
  const { userStats } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone_number ?? "");
    }
  }, [user]);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Operator";
  const initials = user ? getInitials(user) : "OP";
  const joined = user
    ? new Date(user.date_joined).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ first_name: firstName.trim(), last_name: lastName.trim(), phone_number: phone.trim() });
      toast.success("Profile updated.");
      setEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      onLogout();
      onClose();
    } catch {
      toast.error("Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-cyan/30 glass"
          >
            <div className="relative p-5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Operator Profile</div>
                <button onClick={onClose} className="rounded-md border border-cyan/20 p-1.5 hover:border-cyan/60">
                  <X className="h-4 w-4 text-cyan" />
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full border-2 border-cyan/50 bg-cyan/10 flex items-center justify-center">
                  <span className="text-cyan font-mono text-lg">{initials}</span>
                </div>
                <div>
                  <div className="text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>{displayName}</div>
                  <div className="text-xs font-mono text-cyan">{user?.email}</div>
                </div>
              </div>

              {!editing ? (
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-mono">
                  <InfoRow label="Email" value={user?.email ?? "—"} />
                  <InfoRow label="Member Since" value={joined} />
                  <InfoRow label="Phone" value={user?.phone_number || "—"} />
                  <InfoRow label="Verification" value={user?.is_verified ? "VERIFIED" : "PENDING"} tone={user?.is_verified ? "safe" : undefined} />
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  <Field label="First Name" value={firstName} onChange={setFirstName} />
                  <Field label="Last Name" value={lastName} onChange={setLastName} />
                  <Field label="Phone" value={phone} onChange={setPhone} />
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSave} disabled={saving} className="flex-1 rounded-md border border-cyan/50 bg-cyan/10 py-2 text-xs font-mono text-cyan">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditing(false)} className="flex-1 rounded-md border border-cyan/20 py-2 text-xs font-mono text-muted-foreground">Cancel</button>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Your Stats</div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon={Target} label="Threats" value={String(userStats?.threats_detected ?? 0)} />
                  <StatCard icon={Activity} label="Analyses" value={String(userStats?.analyses ?? 0)} />
                  <StatCard icon={TrendingUp} label="Accuracy" value={`${userStats?.model_accuracy?.toFixed(1) ?? 0}%`} />
                </div>
              </div>

              <div className="mt-6 space-y-1.5">
                {!editing && (
                  <button onClick={() => setEditing(true)} className="flex w-full items-center gap-3 rounded-md border border-cyan/15 bg-black/30 px-3 py-2.5 text-sm font-mono hover:border-cyan/40 hover:text-cyan transition">
                    <Edit3 className="h-4 w-4 text-cyan/80" /> Edit Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm font-mono text-danger hover:bg-danger/20 transition disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" /> {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-cyan/20 bg-black/30 px-2 py-2 text-sm font-mono outline-none focus:border-cyan/60" />
    </label>
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

function StatCard({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded border border-cyan/20 bg-black/30 p-2.5 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-cyan" />
      <div className="mt-1 text-sm font-mono text-cyan text-glow">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function getInitials(user: UserProfile) {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
}
