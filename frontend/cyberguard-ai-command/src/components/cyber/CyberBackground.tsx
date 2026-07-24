import { useEffect, useRef } from "react";

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.4,
      });
    }

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX * devicePixelRatio;
      mouse.current.y = e.clientY * devicePixelRatio;
    };
    window.addEventListener("mousemove", onMove);

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      // Mouse glow
      const grd = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 260 * devicePixelRatio);
      grd.addColorStop(0, "rgba(56,220,255,0.10)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = "rgba(56,220,255,0.55)";
        ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const max = 140 * devicePixelRatio;
          if (d2 < max * max) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56,220,255,${0.2 * (1 - Math.sqrt(d2) / max)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      {/* Base */}
      <div className="fixed inset-0 -z-30 bg-[#06070A]" />
      {/* Grid */}
      <div className="fixed inset-0 -z-20 cyber-grid animate-grid-drift opacity-60" />
      {/* Radial vignette */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
      {/* Ambient gradients */}
      <div className="fixed -z-20 -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan/10 blur-3xl" />
      <div className="fixed -z-20 -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-electric/10 blur-3xl" />
      {/* Particles canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
      {/* Subtle scanline */}
      <div className="pointer-events-none fixed inset-x-0 -z-10 h-32 bg-gradient-to-b from-transparent via-cyan/[0.04] to-transparent animate-scan-line" />
    </>
  );
}
