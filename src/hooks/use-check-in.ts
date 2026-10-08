import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LeaderRow = Database["public"]["Tables"]["leaderboard_profiles"]["Row"];

/** Saves an invite code from the link, and records a daily check-in once signed in. */
export function useCheckIn() {
  const [me, setMe] = useState<LeaderRow | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[a-f0-9]{8}$/.test(ref)) localStorage.setItem("csx_ref", ref);
    async function run(user: { user_metadata?: Record<string, unknown>; email?: string } | null) {
      setSignedIn(Boolean(user));
      if (!user) { setMe(null); return; }
      const meta = user.user_metadata ?? {};
      const name = String(meta["full_name"] ?? meta["name"] ?? user.email?.split("@")[0] ?? "");
      const avatar = (meta["avatar_url"] ?? meta["picture"]) as string | undefined;
      const args: { _ref?: string; _name?: string; _avatar?: string } = { _name: name };
      const ref = localStorage.getItem("csx_ref"); if (ref) args._ref = ref; if (avatar) args._avatar = avatar;
      const { data, error } = await supabase.rpc("check_in", args);
      if (!error && data) { setMe(data as LeaderRow); localStorage.removeItem("csx_ref"); }
    }
    supabase.auth.getUser().then(({ data }) => run(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_IN") run(session?.user ?? null); if (event === "SIGNED_OUT") run(null); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { me, signedIn };
}
