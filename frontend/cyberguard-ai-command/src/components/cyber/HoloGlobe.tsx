import { motion } from "motion/react";
import { useMemo } from "react";

// SVG-based holographic globe with orbit rings, nodes, and animated packets.
export function HoloGlobe() {
  const nodes = useMemo(() => {
    const arr: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const r = 90 + (i % 3) * 6;
      arr.push({
        x: 150 + Math.cos(angle) * r,
        y: 150 + Math.sin(angle) * r * 0.7,
        delay: i * 0.15,
      });
    }
    return arr;
  }, []);

  const connections = useMemo(() => {
    const arr: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a && b && a !== b) arr.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, delay: i * 0.4 });
    }
    return arr;
  }, [nodes]);

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-cyan/10 blur-3xl" />
      <div className="absolute inset-8 rounded-full bg-electric/10 blur-2xl" />

      {/* Rotating ring decorations */}
      <div className="absolute inset-0 rounded-full border border-cyan/20 animate-spin-slow" />
      <div className="absolute inset-4 rounded-full border border-dashed border-electric/30 animate-spin-slower" />
      <div className="absolute inset-10 rounded-full border border-cyan/15 animate-spin-slow" style={{ animationDuration: "45s" }} />

      {/* Radar sweep */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[86%] w-[86%] rounded-full overflow-hidden">
          <div
            className="h-full w-full animate-radar origin-center"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(56,220,255,0.18) 30deg, transparent 60deg)",
            }}
          />
        </div>
      </div>

      <svg viewBox="0 0 300 300" className="relative w-full h-full">
        <defs>
          <radialGradient id="earthGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56,220,255,0.35)" />
            <stop offset="60%" stopColor="rgba(20,60,120,0.5)" />
            <stop offset="100%" stopColor="rgba(6,7,10,0.9)" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(56,220,255,0.9)" />
            <stop offset="100%" stopColor="rgba(120,120,255,0.2)" />
          </linearGradient>
        </defs>

        {/* Earth sphere */}
        <circle cx="150" cy="150" r="80" fill="url(#earthGrad)" stroke="rgba(56,220,255,0.6)" strokeWidth="0.6" />

        {/* Latitude arcs */}
        {[-40, -20, 0, 20, 40].map((lat) => (
          <ellipse
            key={lat}
            cx="150"
            cy={150 + lat * 0.4}
            rx="80"
            ry={Math.cos((lat * Math.PI) / 90) * 12 + 3}
            fill="none"
            stroke="rgba(56,220,255,0.25)"
            strokeWidth="0.4"
          />
        ))}
        {/* Longitude arcs */}
        {[-60, -30, 0, 30, 60].map((lng) => (
          <ellipse
            key={lng}
            cx="150"
            cy="150"
            rx={Math.abs(Math.cos((lng * Math.PI) / 180)) * 80}
            ry="80"
            fill="none"
            stroke="rgba(56,220,255,0.2)"
            strokeWidth="0.4"
          />
        ))}

        {/* Connections between nodes */}
        {connections.map((c, i) => (
          <g key={`c-${i}`}>
            <line
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke="url(#lineGrad)"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <circle r="1.5" fill="#38dcff">
              <animateMotion
                dur={`${3 + (i % 3)}s`}
                repeatCount="indefinite"
                begin={`${c.delay}s`}
                path={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`}
              />
            </circle>
          </g>
        ))}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="3" fill="rgba(56,220,255,0.15)">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin={`${n.delay}s`} />
            </circle>
            <circle cx={n.x} cy={n.y} r="1.5" fill="#38dcff">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center"
        >
          <div className="text-[10px] tracking-[0.4em] text-cyan/70">GLOBAL GRID</div>
          <div className="text-2xl font-light text-glow text-cyan" style={{ fontFamily: "Orbitron" }}>
            SECURE
          </div>
        </motion.div>
      </div>
    </div>
  );
}
