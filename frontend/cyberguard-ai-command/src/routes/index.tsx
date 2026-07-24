import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { BootScreen } from "@/components/cyber/BootScreen";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { HoloGlobe } from "@/components/cyber/HoloGlobe";
import { AIAssistant } from "@/components/cyber/AIAssistant";
import { StatsPanel } from "@/components/cyber/StatsPanel";
import { PacketStream } from "@/components/cyber/PacketStream";
import { MODULES, ModuleTile } from "@/components/cyber/modules";
import { ModulePanel } from "@/components/cyber/ModulePanel";
import { LoginScreen, SignupScreen, AIVerification } from "@/components/cyber/AuthScreens";
import { NetworkAnalysisModal } from "@/components/cyber/NetworkAnalysisModal";
import { TopBarActions } from "@/components/cyber/ProfileDrawer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberGuard AI · Autonomous Cyber Defense Command Center" },
      {
        name: "description",
        content:
          "CyberGuard AI is an immersive AI-powered cyber defense command center — live threat detection, holographic globe, prediction engine, and neural network intelligence.",
      },
      { property: "og:title", content: "CyberGuard AI · Cyber Defense Command Center" },
      { property: "og:description", content: "Enter a cinematic SOC experience powered by AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "boot" | "login" | "signup" | "verify" | "app";

function Index() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-foreground">
      <CyberBackground />

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <BootScreen key="boot" onComplete={() => setPhase("login")} />
        )}
        {phase === "login" && (
          <LoginScreen
            key="login"
            onLogin={() => setPhase("verify")}
            onSignup={() => setPhase("signup")}
          />
        )}
        {phase === "signup" && (
          <SignupScreen key="signup" onCreated={() => setPhase("login")} onBack={() => setPhase("login")} />
        )}
        {phase === "verify" && (
          <AIVerification key="verify" onDone={() => setPhase("app")} />
        )}
      </AnimatePresence>

      {phase === "app" && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <CommandCenter
            onOpenModule={setOpenModule}
            onAnalyze={() => setAnalysisOpen(true)}
            onLogout={() => setPhase("login")}
          />
        </motion.div>
      )}

      <ModulePanel moduleId={openModule} onClose={() => setOpenModule(null)} />
      <NetworkAnalysisModal open={analysisOpen} onClose={() => setAnalysisOpen(false)} />
    </div>
  );
}

function CommandCenter({
  onOpenModule, onAnalyze, onLogout,
}: {
  onOpenModule: (id: string) => void;
  onAnalyze: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Top HUD bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#06070A]/50 border-b border-cyan/10">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0 h-9 w-9 rounded-lg border border-cyan/40 flex items-center justify-center bg-cyan/10">
              <div className="absolute inset-0 rounded-lg border border-cyan/30 animate-spin-slow" />
              <span className="text-cyan text-glow font-light" style={{ fontFamily: "Orbitron" }}>C</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground truncate">Autonomous Defense</div>
              <div className="text-sm sm:text-base font-light text-glow truncate" style={{ fontFamily: "Orbitron" }}>
                CYBERGUARD <span className="text-cyan">AI</span> · COMMAND CENTER
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[10px] sm:text-xs font-mono">
            <span className="hidden sm:flex items-center gap-1 text-safe"><span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />ALL SYSTEMS NOMINAL</span>
            <span className="text-muted-foreground hidden md:inline">UTC {new Date().toUTCString().slice(17, 25)}</span>
            <span className="rounded border border-cyan/30 px-2 py-0.5 text-cyan">SEC LVL · 5</span>
            <TopBarActions onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="relative mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* Left */}
          <div className="space-y-4 order-2 lg:order-1">
            <AIAssistant />
            <ModuleGrid onOpenModule={onOpenModule} slice={[0, 4]} />
          </div>

          {/* Center: globe + surrounding modules */}
          <div className="order-1 lg:order-2 space-y-4">
            <div className="relative glass rounded-2xl p-4 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan/10 to-transparent" />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>Global Sensor Grid</span>
                <span className="flex items-center gap-1 text-cyan"><span className="h-1.5 w-1.5 bg-cyan rounded-full animate-pulse" />streaming</span>
              </div>
              <HoloGlobe />
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="rounded border border-cyan/20 p-2"><div className="text-cyan text-lg">12,847</div><div className="text-muted-foreground uppercase tracking-widest">Nodes</div></div>
                <div className="rounded border border-cyan/20 p-2"><div className="text-safe text-lg">99.98%</div><div className="text-muted-foreground uppercase tracking-widest">Uptime</div></div>
                <div className="rounded border border-cyan/20 p-2"><div className="text-warn text-lg">3</div><div className="text-muted-foreground uppercase tracking-widest">Alerts</div></div>
              </div>
            </div>
            <ModuleGrid onOpenModule={onOpenModule} slice={[4, 8]} cols={4} />
          </div>

          {/* Right */}
          <div className="space-y-4 order-3">
            <StatsPanel />
            <ModuleGrid onOpenModule={onOpenModule} slice={[8, 12]} />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-4">
          <PacketStream />
        </div>

        <footer className="mt-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>© CyberGuard AI · Restricted Access</span>
          <span className="flex items-center gap-4">
            <span>Kernel 5.15.0-defcon</span>
            <span className="text-cyan">Session: {Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
          </span>
        </footer>
      </main>

      {/* Floating Analyze Network FAB */}
      <motion.button
        onClick={onAnalyze}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 right-6 z-30 group flex items-center gap-2 rounded-full border border-cyan/60 bg-cyan/10 backdrop-blur-md px-5 py-3 text-xs uppercase tracking-[0.3em] text-cyan hover:bg-cyan/20 transition shadow-[0_0_40px_rgba(0,255,255,0.35)]"
        style={{ fontFamily: "Orbitron" }}
      >
        <span className="absolute inset-0 rounded-full border border-cyan/40 animate-ping opacity-30" />
        <ShieldAlert className="h-4 w-4" />
        Analyze Network
      </motion.button>
    </div>
  );
}

function ModuleGrid({
  onOpenModule,
  slice,
  cols = 2,
}: {
  onOpenModule: (id: string) => void;
  slice: [number, number];
  cols?: number;
}) {
  const items = MODULES.slice(slice[0], slice[1]);
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((m, i) => (
        <ModuleTile key={m.id} m={m} index={i} onClick={() => onOpenModule(m.id)} />
      ))}
    </div>
  );
}
