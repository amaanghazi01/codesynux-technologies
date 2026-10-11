import { useEffect, useState } from "react";
import { Infinity as InfinityIcon, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = { unlimited: boolean; limit: number; used: number };

export function PointsBadge({ refreshKey }: { refreshKey: number }) {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      supabase.rpc("ai_points_status").then(({ data }) => { if (data) setStatus(data as unknown as Status); });
    }, 400);
    return () => window.clearTimeout(t);
  }, [refreshKey]);
  if (!status) return null;
  const left = Math.max(0, status.limit - status.used);
  return (
    <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground" title={status.unlimited ? "Pro: unlimited access" : "Free points left today"}>
      {status.unlimited ? <><InfinityIcon size={14} /> Unlimited</> : <><Zap size={14} /> {left}/{status.limit}</>}
    </span>
  );
}
