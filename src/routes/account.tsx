import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Box, CircleUserRound, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import mark from "@/assets/codesynux-mark.png.asset.json";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>) => ({ view: search.view === "orders" || search.view === "saves" ? search.view : "account" as "orders" | "saves" | "account" }),
  head: () => ({ meta: [
    { title: "My account — Codesynux" },
    { name: "description", content: "View your Codesynux account, orders, and saved items." },
    { property: "og:title", content: "My account — Codesynux" },
    { property: "og:description", content: "Your Codesynux profile, orders, and saved items." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: Account,
});
function Account() {
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? data.user?.phone ?? null); setLoaded(true); });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => { setEmail(session?.user.email ?? session?.user.phone ?? null); setLoaded(true); });
    return () => subscription.subscription.unsubscribe();
  }, []);
  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/" }); }
  return <div className="account-page"><header className="account-header"><Link to="/" aria-label="Codesynux home"><img src={mark.url} width="36" height="36" alt="" /></Link><Link to="/">Home</Link></header><main className="profile-main"><p className="section-index">My Profile</p><h1>{view === "orders" ? "Orders" : view === "saves" ? "Your Saves" : "Account"}</h1><div className="profile-layout"><nav className="profile-nav" aria-label="Account sections"><Link to="/account" search={{ view: "orders" }} className={view === "orders" ? "selected" : ""}><Box size={18}/> Orders</Link><Link to="/account" search={{ view: "saves" }} className={view === "saves" ? "selected" : ""}><Bookmark size={18}/> Your Saves</Link><Link to="/account" search={{ view: "account" }} className={view === "account" ? "selected" : ""}><Settings size={18}/> Account</Link></nav><div className="profile-detail">{!loaded ? <p>Loading your account…</p> : !email ? <><CircleUserRound size={30}/><h2>Sign in to continue.</h2><p>Access your account and see what you’ve saved.</p><Button asChild className="profile-signin"><Link to="/auth">Sign in</Link></Button></> : view === "account" ? <><CircleUserRound size={30}/><h2>Your account</h2><p>{email}</p><Button variant="outline" onClick={signOut}><LogOut size={16}/> Sign out</Button></> : <><div className="empty-icon">{view === "orders" ? <Box size={30}/> : <Bookmark size={30}/>}</div><h2>{view === "orders" ? "No orders yet." : "No saved items yet."}</h2><p>{view === "orders" ? "Your orders will appear here." : "Items you save will appear here."}</p></>}</div></div></main></div>;
}
