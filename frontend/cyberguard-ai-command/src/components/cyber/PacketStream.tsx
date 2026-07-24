import { useEffect, useRef, useState } from "react";
import { PROTOCOLS, randIP, randPort, randAttack } from "@/lib/cyber-data";

interface Packet {
  id: number;
  time: string;
  proto: string;
  src: string;
  dst: string;
  dport: number;
  prediction: string;
  confidence: number;
  benign: boolean;
}

let counter = 0;

function makePacket(): Packet {
  const benign = Math.random() > 0.28;
  return {
    id: ++counter,
    time: new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + String(Date.now() % 1000).padStart(3, "0"),
    proto: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    src: randIP(),
    dst: randIP(),
    dport: randPort(),
    prediction: benign ? "BENIGN" : randAttack().toUpperCase(),
    confidence: benign ? 90 + Math.random() * 9 : 70 + Math.random() * 29,
    benign,
  };
}

export function PacketStream() {
  const [packets, setPackets] = useState<Packet[]>(() =>
    Array.from({ length: 12 }, makePacket),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPackets((p) => [...p.slice(-40), makePacket()]);
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [packets]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan/10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="h-2 w-2 rounded-full bg-warn" />
          <span className="h-2 w-2 rounded-full bg-safe" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">packet_stream.log · tail -f</span>
        </div>
        <span className="text-[10px] text-safe flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-safe rounded-full animate-pulse" /> capturing
        </span>
      </div>
      <div ref={ref} className="h-40 overflow-y-auto px-4 py-2 font-mono text-[11px] leading-relaxed">
        {packets.map((p) => (
          <div key={p.id} className="grid grid-cols-[80px_50px_140px_140px_60px_1fr_60px] gap-2 items-center">
            <span className="text-muted-foreground">{p.time}</span>
            <span className="text-electric">{p.proto}</span>
            <span className="text-foreground/70">{p.src}</span>
            <span className="text-foreground/70">→ {p.dst}</span>
            <span className="text-cyan">:{p.dport}</span>
            <span className={p.benign ? "text-safe" : "text-danger font-bold"}>
              {p.benign ? "✓ " : "⚠ "}
              {p.prediction}
            </span>
            <span className={p.benign ? "text-muted-foreground" : "text-warn"}>{p.confidence.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
