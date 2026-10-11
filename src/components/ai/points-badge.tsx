import { useEffect, useState } from "react";
import { Infinity as InfinityIcon, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = { unlimited: boolean; limit: number; used: number };

function untilMidnight() {
  const now = new Date();
  const m = new Date(now); m.setHours(24, 0, 0, 0);
  const s = Math.floor((m.getTime() - now.getTime()) / 1000);
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

export function PointsBadge({ refreshKey }: { refreshKey: number }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [left, setLeft] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => {
      supabase.rpc("ai_points_status").then(({ data }) => { if (data) setStatus(data as unknown as Status); });
    }, 400);
    return () => window.clearTimeout(t);
  }, [refreshKey]);
  useEffect(() => { setLeft(untilMidnight()); const i = window.setInterval(() => setLeft(untilMidnight()), 30000); return () => window.clearInterval(i); }, []);
  if (!status) return null;
  const pts = Math.max(0, status.limit - status.used);
  return (
    <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground" title={status.unlimited ? "Pro: unlimited access" : `Free points left today · refills at midnight in ${left}`}>
      {status.unlimited ? <><InfinityIcon size={14} /> Unlimited</> : <><Zap size={14} /> {pts}/{status.limit} · {left}</>}
    </span>
  );
}
