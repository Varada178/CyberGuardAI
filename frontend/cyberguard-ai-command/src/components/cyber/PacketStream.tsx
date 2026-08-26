import { useEffect, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";

export function PacketStream() {
  const { recentPredictions, loading } = useDashboard();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [recentPredictions]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan/10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="h-2 w-2 rounded-full bg-warn" />
          <span className="h-2 w-2 rounded-full bg-safe" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">prediction_stream.log</span>
        </div>
        <span className="text-[10px] text-safe flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-safe rounded-full animate-pulse" /> from backend
        </span>
      </div>
      <div ref={ref} className="h-40 overflow-y-auto px-4 py-2 font-mono text-[11px] leading-relaxed">
        {loading && recentPredictions.length === 0 && (
          <div className="text-muted-foreground">Loading recent predictions...</div>
        )}
        {!loading && recentPredictions.length === 0 && (
          <div className="text-muted-foreground">No predictions yet. Run Analyze Network to create entries.</div>
        )}
        {recentPredictions.map((p) => {
          const time = new Date(p.created_at).toLocaleTimeString("en-US", { hour12: false });
          return (
            <div key={p.id} className="grid grid-cols-[80px_1fr_80px_60px] gap-2 items-center">
              <span className="text-muted-foreground">{time}</span>
              <span className={p.is_attack ? "text-danger font-bold" : "text-safe"}>
                {p.is_attack ? "⚠ " : "✓ "}
                {p.predicted_attack}
              </span>
              <span className="text-cyan truncate">{p.risk_level}</span>
              <span className={p.is_attack ? "text-warn" : "text-muted-foreground"}>
                {p.confidence.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
