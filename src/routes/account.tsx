import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleUserRound, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/account")({
  validateSearch: () => ({ view: "account" as const }),
  head: () => ({ meta: [
    { title: "My account — Codesynux" },
    { name: "description", content: "Manage your Codesynux account and sign-in access." },
    { property: "og:title", content: "My account — Codesynux" },
    { property: "og:description", content: "Your personal Codesynux account and profile." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: Account,
});
function Account() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? data.user?.phone ?? null); setLoaded(true); });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => { setEmail(session?.user.email ?? session?.user.phone ?? null); setLoaded(true); });
    return () => subscription.subscription.unsubscribe();
  }, []);
  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/" }); }
  return <PageShell><main className="profile-main"><p className="section-index">My Profile</p><h1>My Account</h1><div className="profile-layout"><nav className="profile-nav" aria-label="Account sections"><Link to="/account" search={{ view: "account" }} className="selected" aria-current="page"><Settings size={18} strokeWidth={1.6}/> My Account</Link></nav><div className="profile-detail">{!loaded ? <p>Loading your account…</p> : !email ? <><CircleUserRound size={30} strokeWidth={1.5}/><h2>Welcome to Codesynux.</h2><p>Sign in or create your account to make your next idea happen.</p><Button asChild className="profile-signin"><Link to="/auth">Sign in / Sign up</Link></Button></> : <><CircleUserRound size={30} strokeWidth={1.5}/><h2>Your account</h2><p className="break-words">{email}</p><Button variant="outline" onClick={signOut}><LogOut size={16}/> Sign out</Button></>}</div></div></main></PageShell>;
}
