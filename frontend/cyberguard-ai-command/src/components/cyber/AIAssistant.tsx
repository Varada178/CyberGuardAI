import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AI_MESSAGES } from "@/lib/cyber-data";

export function AIAssistant() {
  const [messages, setMessages] = useState<{ text: string; typed: string }[]>([]);
  useEffect(() => {
    let idx = 0;
    const add = () => {
      const full = AI_MESSAGES[idx % AI_MESSAGES.length];
      const entry = { text: full, typed: "" };
      setMessages((m) => [...m.slice(-4), entry]);
      let i = 0;
      const typer = setInterval(() => {
        i++;
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.text === full) last.typed = full.slice(0, i);
          return copy;
        });
        if (i >= full.length) clearInterval(typer);
      }, 22);
      idx++;
    };
    add();
    const id = setInterval(add, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-2xl p-4 w-full">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan/40 blur-md animate-pulse" />
          <div className="relative h-10 w-10 rounded-full border border-cyan/50 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(56,220,255,0.9)]" />
            <div className="absolute inset-0 rounded-full border border-cyan/30 animate-spin-slow" />
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI Assistant</div>
          <div className="text-sm font-medium text-cyan text-glow" style={{ fontFamily: "Orbitron" }}>
            J.A.R.V.I.S · Online
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 min-h-[120px]">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-foreground/80 leading-relaxed font-mono border-l-2 border-cyan/40 pl-2"
          >
            {m.typed}
            {m.typed.length < m.text.length && <span className="text-cyan animate-blink">▍</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
