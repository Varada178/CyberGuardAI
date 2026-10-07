import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bell,
  X,
  LogOut,
  Edit3,
  Activity,
  Target,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  User,
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenProfile(false);
        setOpenNotif(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">

        {/* ================= NOTIFICATIONS ================= */}

        <div className="relative">
          <button
            onClick={() => {
              setOpenNotif((v) => !v);
              setOpenProfile(false);
            }}
            className="
              relative flex h-9 w-9 items-center justify-center
              rounded-md border border-cyan/30
              bg-black/40
              transition
              hover:border-cyan/60
              hover:bg-cyan/5
            "
          >
            <Bell className="h-4 w-4 text-cyan" />

            {alerts.length > 0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  flex h-4 min-w-[16px]
                  items-center justify-center
                  rounded-full
                  bg-danger
                  px-1
                  text-[9px]
                  font-mono
                  text-white
                "
              >
                {alerts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                  scale: 0.98,
                }}
                className="
                  absolute right-0 top-11 z-40
                  w-80
                  rounded-xl
                  border border-cyan/30
                  glass
                  p-3
                  shadow-2xl
                "
              >
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.3em]
                      text-muted-foreground
                    "
                  >
                    Alerts
                  </div>

                  <button
                    onClick={() => setOpenNotif(false)}
                    className="rounded p-1 hover:bg-cyan/10"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-cyan" />
                  </button>
                </div>

                <div className="max-h-80 space-y-1.5 overflow-y-auto">
                  {alerts.length === 0 && (
                    <div className="p-2 text-xs font-mono text-muted-foreground">
                      No attack alerts yet.
                    </div>
                  )}

                  {alerts.map((n) => (
                    <div
                      key={n.id}
                      className="
                        flex items-start gap-2.5
                        rounded-md
                        border border-warn/30
                        bg-black/40
                        p-2.5
                        text-warn
                      "
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-foreground/90">
                          {n.title}
                        </div>

                        <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                          {new Date(n.created_at).toLocaleString()} ·{" "}
                          {n.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= PROFILE BUTTON ================= */}

        <button
          onClick={() => {
            setOpenProfile(true);
            setOpenNotif(false);
          }}
          className="
            relative h-9 w-9
            rounded-full
            border-2 border-cyan/50
            bg-cyan/10
            flex items-center justify-center
            transition
            hover:border-cyan
            hover:bg-cyan/15
          "
          title="Open Operator Profile"
        >
          <span className="absolute inset-0 rounded-full border border-cyan/40 animate-spin-slow" />

          <span className="relative text-cyan font-mono text-xs">
            {initials}
          </span>
        </button>
      </div>

      {/* ================= PROFILE MODAL ================= */}

      <ProfileDrawer
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onLogout={onLogout}
        user={user}
      />
    </>
  );
}

/* ============================================================
   PROFILE MODAL
   ============================================================ */

function ProfileDrawer({
  open,
  onClose,
  onLogout,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: UserProfile | null;
}) {
  const { saveProfile, logout } = useAuth();
  const { userStats } = useDashboard();

  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* ----------------------------------------------------------
     Sync user data
  ---------------------------------------------------------- */

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone_number ?? "");
    }
  }, [user]);

  /* ----------------------------------------------------------
     User information
  ---------------------------------------------------------- */

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : "Operator";

  const initials = user ? getInitials(user) : "OP";

  const joined = user
    ? new Date(user.date_joined).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  /* ----------------------------------------------------------
     Save profile
  ---------------------------------------------------------- */

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setSaving(true);

    try {
      await saveProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
      });

      toast.success("Profile updated successfully.");

      setEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------------------------------
     Logout
  ---------------------------------------------------------- */

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
          {/* ==================================================
              BACKDROP
          ================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              fixed inset-0
              z-40
              bg-black/70
              backdrop-blur-md
            "
          />

          {/* ==================================================
              CENTER PROFILE PANEL
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              fixed
              left-1/2
              top-1/2
              z-50
              w-[min(720px,calc(100vw-32px))]
              -translate-x-1/2
              -translate-y-1/2
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-cyan/30
                bg-[#030914]/95
                shadow-[0_0_80px_rgba(0,220,255,0.12)]
                backdrop-blur-xl
              "
            >
              {/* ==================================================
                  TOP CYBER LINE
              ================================================== */}

              <div
                className="
                  absolute left-0 right-0 top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-cyan
                  to-transparent
                "
              />

              {/* ==================================================
                  HEADER
              ================================================== */}

              <div
                className="
                  flex items-center justify-between
                  border-b border-cyan/15
                  px-6 py-4
                "
              >
                <div>
                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.4em]
                      text-cyan
                    "
                  >
                    CyberGuardAI
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      uppercase
                      tracking-[0.25em]
                      text-muted-foreground
                    "
                  >
                    Operator Profile
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="
                    rounded-lg
                    border border-cyan/15
                    bg-black/30
                    p-2
                    transition
                    hover:border-cyan/50
                    hover:bg-cyan/10
                  "
                >
                  <X className="h-4 w-4 text-cyan" />
                </button>
              </div>

              {/* ==================================================
                  MAIN CONTENT
              ================================================== */}

              <div className="p-6">

                {/* ==================================================
                    USER HEADER
                ================================================== */}

                <div className="flex items-center gap-5">

                  {/* Avatar */}

                  <div
                    className="
                      relative
                      flex h-20 w-20
                      shrink-0
                      items-center justify-center
                      rounded-full
                      border-2 border-cyan/50
                      bg-cyan/10
                      shadow-[0_0_30px_rgba(0,220,255,0.10)]
                    "
                  >
                    <div
                      className="
                        absolute inset-1
                        rounded-full
                        border border-cyan/20
                      "
                    />

                    <span
                      className="
                        relative
                        text-2xl
                        font-mono
                        text-cyan
                        text-glow
                      "
                    >
                      {initials}
                    </span>

                    {/* Online indicator */}

                    <span
                      className="
                        absolute
                        bottom-1
                        right-1
                        h-3
                        w-3
                        rounded-full
                        border-2
                        border-[#030914]
                        bg-safe
                        shadow-[0_0_10px_rgba(0,255,150,0.7)]
                      "
                    />
                  </div>

                  {/* Name */}

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        text-2xl
                        font-light
                        text-glow
                      "
                      style={{
                        fontFamily: "Orbitron",
                      }}
                    >
                      {displayName}
                    </div>

                    <div
                      className="
                        mt-1
                        flex items-center gap-2
                        text-sm
                        font-mono
                        text-cyan
                      "
                    >
                      <Mail className="h-3.5 w-3.5" />

                      <span className="truncate">
                        {user?.email ?? "—"}
                      </span>
                    </div>

                    <div
                      className="
                        mt-2
                        inline-flex
                        items-center gap-1.5
                        rounded-full
                        border border-safe/30
                        bg-safe/5
                        px-2.5 py-1
                        text-[9px]
                        uppercase
                        tracking-widest
                        text-safe
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-safe" />

                      {user?.is_verified
                        ? "Verified Operator"
                        : "Verification Pending"}
                    </div>
                  </div>

                  {/* Edit button */}

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border border-cyan/25
                        bg-cyan/5
                        px-3
                        py-2
                        text-xs
                        font-mono
                        text-cyan
                        transition
                        hover:border-cyan/60
                        hover:bg-cyan/10
                      "
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      EDIT
                    </button>
                  )}
                </div>

                {/* ==================================================
                    PROFILE INFORMATION / EDIT
                ================================================== */}

                {!editing ? (
                  <div className="mt-6 grid grid-cols-4 gap-3">

                    <InfoRow
                      icon={User}
                      label="First Name"
                      value={user?.first_name ?? "—"}
                    />

                    <InfoRow
                      icon={User}
                      label="Last Name"
                      value={user?.last_name ?? "—"}
                    />

                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={user?.phone_number || "Not Added"}
                    />

                    <InfoRow
                      icon={CalendarDays}
                      label="Member Since"
                      value={joined}
                    />
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-cyan/15 bg-black/25 p-4">

                    <div
                      className="
                        mb-4
                        text-[10px]
                        uppercase
                        tracking-[0.3em]
                        text-muted-foreground
                      "
                    >
                      Edit Operator Information
                    </div>

                    <div className="grid grid-cols-3 gap-3">

                      <Field
                        label="First Name"
                        value={firstName}
                        onChange={setFirstName}
                      />

                      <Field
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                      />

                      <Field
                        label="Phone"
                        value={phone}
                        onChange={setPhone}
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">

                      <button
                        onClick={() => setEditing(false)}
                        disabled={saving}
                        className="
                          rounded-lg
                          border border-cyan/15
                          px-4 py-2
                          text-xs
                          font-mono
                          text-muted-foreground
                          transition
                          hover:border-cyan/40
                          hover:text-foreground
                        "
                      >
                        CANCEL
                      </button>

                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="
                          rounded-lg
                          border border-cyan/50
                          bg-cyan/10
                          px-5 py-2
                          text-xs
                          font-mono
                          text-cyan
                          transition
                          hover:bg-cyan/15
                          disabled:opacity-50
                        "
                      >
                        {saving ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="mt-6">

                  <div className="mb-3 flex items-center justify-between">

                    <div
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.3em]
                        text-muted-foreground
                      "
                    >
                      Operator Analytics
                    </div>

                    <div
                      className="
                        flex items-center gap-1.5
                        text-[9px]
                        font-mono
                        uppercase
                        tracking-widest
                        text-safe
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-safe" />
                      SYSTEM ACTIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <StatCard
                      icon={Target}
                      label="Threats Detected"
                      value={String(
                        userStats?.threats_detected ?? 0
                      )}
                    />

                    <StatCard
                      icon={Activity}
                      label="Total Analyses"
                      value={String(
                        userStats?.analyses ?? 0
                      )}
                    />

                    <StatCard
                      icon={TrendingUp}
                      label="Model Accuracy"
                      value={`${(
                        userStats?.model_accuracy ?? 0
                      ).toFixed(1)}%`}
                    />
                  </div>
                </div>

                {/* ==================================================
                    ACCOUNT STATUS
                ================================================== */}

                <div
                  className="
                    mt-5
                    grid grid-cols-2
                    gap-3
                  "
                >

                  <div
                    className="
                      flex items-center gap-3
                      rounded-lg
                      border border-cyan/15
                      bg-black/25
                      px-4 py-3
                    "
                  >
                    <div
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-md
                        bg-cyan/10
                      "
                    >
                      <ShieldCheck className="h-4 w-4 text-cyan" />
                    </div>

                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Account Status
                      </div>

                      <div className="mt-0.5 text-xs font-mono text-safe">
                        ACTIVE
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      flex items-center gap-3
                      rounded-lg
                      border border-cyan/15
                      bg-black/25
                      px-4 py-3
                    "
                  >
                    <div
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-md
                        bg-cyan/10
                      "
                    >
                      <Mail className="h-4 w-4 text-cyan" />
                    </div>

                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Email Verification
                      </div>

                      <div
                        className={`mt-0.5 text-xs font-mono ${
                          user?.is_verified
                            ? "text-safe"
                            : "text-warn"
                        }`}
                      >
                        {user?.is_verified
                          ? "VERIFIED"
                          : "PENDING"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="mt-6 flex items-center justify-between border-t border-cyan/10 pt-5">

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />

                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.25em]
                        text-muted-foreground
                      "
                    >
                      CyberGuardAI Operator
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      border border-danger/40
                      bg-danger/5
                      px-5 py-2.5
                      text-xs
                      font-mono
                      text-danger
                      transition
                      hover:bg-danger/10
                      hover:border-danger/60
                      disabled:opacity-50
                    "
                  >
                    <LogOut className="h-3.5 w-3.5" />

                    {loggingOut
                      ? "LOGGING OUT..."
                      : "LOGOUT"}
                  </button>
                </div>
              </div>

              {/* ==================================================
                  BOTTOM CYBER LINE
              ================================================== */}

              <div
                className="
                  absolute bottom-0 left-0 right-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-cyan/40
                  to-transparent
                "
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   INFO ROW
   ============================================================ */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-lg
        border border-cyan/15
        bg-black/25
        p-3
        transition
        hover:border-cyan/30
      "
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-cyan/70" />

        <div
          className="
            text-[9px]
            uppercase
            tracking-[0.2em]
            text-muted-foreground
          "
        >
          {label}
        </div>
      </div>

      <div className="mt-2 truncate text-xs font-mono text-foreground/90">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   EDIT FIELD
   ============================================================ */

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div
        className="
          mb-1.5
          text-[9px]
          uppercase
          tracking-[0.2em]
          text-muted-foreground
        "
      >
        {label}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border border-cyan/20
          bg-black/40
          px-3 py-2.5
          text-sm
          font-mono
          text-foreground
          outline-none
          transition
          focus:border-cyan/60
          focus:bg-cyan/5
        "
      />
    </label>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border border-cyan/15
        bg-black/25
        px-4 py-3
        transition
        hover:border-cyan/30
      "
    >
      <div className="flex items-center justify-between">

        <div
          className="
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            bg-cyan/10
          "
        >
          <Icon className="h-4 w-4 text-cyan" />
        </div>

        <div
          className="
            text-xl
            font-mono
            text-cyan
            text-glow
          "
        >
          {value}
        </div>
      </div>

      <div
        className="
          mt-2
          text-[9px]
          uppercase
          tracking-[0.15em]
          text-muted-foreground
        "
      >
        {label}
      </div>

      <div
        className="
          absolute
          bottom-0
          left-0
          h-px
          w-full
          bg-cyan/20
        "
      />
    </div>
  );
}

/* ============================================================
   INITIALS
   ============================================================ */

function getInitials(user: UserProfile) {
  const first = user.first_name?.charAt(0) ?? "";
  const last = user.last_name?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "OP";
}