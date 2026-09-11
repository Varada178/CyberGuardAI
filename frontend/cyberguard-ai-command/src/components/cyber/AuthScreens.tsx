import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";

function Frame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan/60 via-transparent to-fuchsia-500/40 opacity-70 blur-[2px]" />
        <div className="absolute -inset-[1px] rounded-2xl border border-cyan/40" />
        <div className="relative glass rounded-2xl p-7 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan/10 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,255,255,0.04) 2px 3px)",
            }}
          />
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg border border-cyan/40 flex items-center justify-center bg-cyan/10">
                <div className="absolute inset-0 rounded-lg border border-cyan/30 animate-spin-slow" />
                <span className="text-cyan text-glow" style={{ fontFamily: "Orbitron" }}>
                  C
                </span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Classified Access
                </div>
                <div className="text-lg font-light text-glow" style={{ fontFamily: "Orbitron" }}>
                  CYBERGUARD <span className="text-cyan">AI</span>
                </div>
              </div>
            </div>
            <div className="mt-5 text-xl font-light" style={{ fontFamily: "Orbitron" }}>
              {title}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{subtitle}</div>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: typeof Mail;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
  onSuccess,
  onVerify,
  onSignup,
}: {
  onSuccess: () => void;
  onVerify: (email: string) => void;
  onSignup: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(email.trim(), password, remember);
      toast.success("Access granted. Welcome back, operator.");
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      if (message.toLowerCase().includes("verify")) {
        toast.message("Email verification required.");
        onVerify(email.trim());
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame title="Operator Sign-In" subtitle="Authenticate to access the SOC">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field
          icon={Mail}
          type="email"
          placeholder="operator@domain"
          value={email}
          onChange={setEmail}
        />
        <Field
          icon={Lock}
          type="password"
          placeholder="passphrase"
          value={password}
          onChange={setPassword}
        />
        <div className="flex items-center justify-between text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-cyan"
            />
            <span className="text-muted-foreground">Remember this terminal</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-2.5 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition disabled:opacity-60"
          style={{ fontFamily: "Orbitron" }}
        >
          <KeyRound className="h-4 w-4" /> {loading ? "Authenticating..." : "Login"}
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
        </button>

        <div className="pt-3 text-center text-xs font-mono text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSignup} className="text-cyan hover:text-glow">
            Create Account
          </button>
        </div>
      </form>
    </Frame>
  );
}

export function SignupScreen({
  onRegistered,
  onBack,
}: {
  onRegistered: (email: string) => void;
  onBack: () => void;
}) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const registeredEmail = await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password,
        confirm_password: confirmPassword,
      });
      toast.success("Registration successful. Check your email for the OTP.");
      onRegistered(registeredEmail);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame title="Register Operator" subtitle="Provision a new SOC identity">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field icon={User} placeholder="First Name" value={firstName} onChange={setFirstName} />
          <Field icon={User} placeholder="Last Name" value={lastName} onChange={setLastName} />
        </div>
        <Field
  icon={Mail}
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={setEmail}
/>
        <Field icon={Phone} placeholder="Phone Number" value={phoneNumber} onChange={setPhoneNumber} />
        <div className="grid grid-cols-2 gap-3">
          <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
          <Field
            icon={Lock}
            type="password"
            placeholder="Confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-cyan/20 bg-black/30 px-3 py-2">
          <Shield className="h-4 w-4 text-cyan/70" />
          <select
            defaultValue="Security Analyst"
            className="w-full bg-transparent text-sm font-mono outline-none"
          >
            <option className="bg-[#06070A]">Administrator</option>
            <option className="bg-[#06070A]">Security Analyst</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-2.5 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition disabled:opacity-60"
          style={{ fontFamily: "Orbitron" }}
        >
          {loading ? "Creating..." : "Create Account"} <ArrowRight className="h-4 w-4" />
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

export function VerifyOTPScreen({
  email,
  onSuccess,
  onBack,
}: {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const { verifyEmailOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      await verifyEmailOtp(email, otp);
      toast.success("Email verified successfully.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame title="Verify Access Code" subtitle={`Enter the OTP sent to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-11 w-11 rounded-md border border-cyan/30 bg-black/30 font-mono text-cyan"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 py-2.5 text-sm uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition disabled:opacity-60"
          style={{ fontFamily: "Orbitron" }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((prev) => {
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
          <div className="text-[10px] uppercase tracking-[0.6em] text-cyan/80">
            Neural Authentication
          </div>
          <div className="mt-2 text-2xl font-light text-glow" style={{ fontFamily: "Orbitron" }}>
            SECURING SESSION
          </div>
        </div>
        <div className="space-y-2 font-mono text-sm">
          {VERIFY_STEPS.map((label, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: index <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 rounded border border-cyan/15 bg-black/30 px-3 py-2 ${
                index <= step ? "text-safe" : "text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  index <= step ? "bg-safe animate-pulse" : "bg-muted"
                }`}
              />
              {label}
              {index === step && <span className="ml-auto text-cyan animate-pulse">●</span>}
            </motion.div>
          ))}
        </div>
        <div className="mt-8 h-[2px] w-full overflow-hidden rounded bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan via-fuchsia-500 to-cyan"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / VERIFY_STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
