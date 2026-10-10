import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const projectKinds = ["Website", "Software", "Mobile app", "Artificial intelligence", "Cybersecurity", "Cloud infrastructure", "Other"];
export const phases = [
  { id: "research", label: "Research" },
  { id: "planning", label: "Planning" },
  { id: "coding", label: "Coding" },
  { id: "testing", label: "Testing" },
  { id: "deployment", label: "Deployment" },
  { id: "maintenance", label: "Maintenance" },
];

export type ConsoleAccess = { loading: boolean; signedIn: boolean; allowed: boolean; role: string | null; email: string | null };

export function useConsoleAccess(): ConsoleAccess {
  const [state, setState] = useState<ConsoleAccess>({ loading: true, signedIn: false, allowed: false, role: null, email: null });
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) { if (alive) setState({ loading: false, signedIn: false, allowed: false, role: null, email: null }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const role = roles?.find(r => r.role === "owner")?.role ?? roles?.find(r => r.role === "pro")?.role ?? null;
      if (alive) setState({ loading: false, signedIn: true, allowed: Boolean(role), role, email: user.email ?? null });
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { load(); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}
