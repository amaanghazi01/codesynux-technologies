import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Copy, Crown, Flame, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useCheckIn, type LeaderRow } from "@/hooks/use-check-in";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [
    { title: "Leaderboard — Codesynux" },
    { name: "description", content: "Climb the Codesynux leaderboard with daily streaks and invites. Top 10 win up to 6 months of free Pro." },
    { property: "og:title", content: "Leaderboard — Codesynux" },
    { property: "og:description", content: "Daily streaks, invites and rewards. Top 10 win up to 6 months of free Pro." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { me, signedIn } = useCheckIn();
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { supabase.from("leaderboard_profiles").select("*").order("points", { ascending: false }).limit(50).then(({ data }) => setRows(data ?? [])); }, [me]);
  const link = me && typeof window !== "undefined" ? `${window.location.origin}/?ref=${me.referral_code}` : "";
  const text = "Join me on Codesynux — the AI platform for building anything.";
  async function share() { if (navigator.share) { try { await navigator.share({ title: "Codesynux", text, url: link }); } catch { /* dismissed */ } } else copy(); }
  async function copy() { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  const myRank = me && rows ? rows.findIndex(r => r.user_id === me.user_id) + 1 : 0;
  return <PageShell><main className="leader-main">
    <div className="reward-banner"><Crown size={20}/><span><strong>Top 10 reward:</strong> up to 6 months of free Pro and a special appreciation badge.</span></div>
    <p className="section-index">Leaderboard</p><h1>Show up. Climb up.</h1>
    <p className="pricing-intro">Earn 10 points a day for your streak, and 100 points for every friend who joins with your link.</p>
    <section className="share-card">{signedIn === false ? <><Share2 size={24}/><h2>Invite friends, earn rewards</h2><p>Sign in to get your personal invite link. When a friend signs up with it, you both get a free certificate and 1 month of free Pro while your streak is active.</p><Button asChild><Link to="/auth">Sign in</Link></Button></> : me ? <><div className="my-stats"><div><Award size={20}/><strong>{myRank || "—"}</strong><span>Rank</span></div><div><Gift size={20}/><strong>{me.points}</strong><span>Points</span></div><div><Flame size={20}/><strong>{me.streak}</strong><span>Day streak</span></div><div><Share2 size={20}/><strong>{me.referrals}</strong><span>Invites</span></div></div><h2>Your invite link</h2><p>You and each friend who signs up get a free certificate and 1 month of free Pro while your streak stays active.</p><div className="link-row"><input readOnly value={link} aria-label="Your invite link"/><Button variant="outline" onClick={copy}><Copy size={16}/>{copied ? "Copied" : "Copy"}</Button><Button onClick={share}><Share2 size={16}/>Share</Button></div><div className="share-apps"><a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer">X</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer">LinkedIn</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer">Facebook</a></div></> : <p>Loading your stats…</p>}</section>
    <ol className="leader-list">{rows === null ? <li className="leader-empty">Loading rankings…</li> : rows.length === 0 ? <li className="leader-empty">No one is on the board yet. Sign in to be first.</li> : rows.map((r, i) => <li key={r.user_id} className={`${i < 10 ? "top" : ""} ${me?.user_id === r.user_id ? "mine" : ""}`}><span className="rank">{i + 1}</span>{r.avatar_url ? <img src={r.avatar_url} alt="" width="40" height="40"/> : <span className="avatar-fallback">{r.display_name.slice(0, 1).toUpperCase()}</span>}<span className="who"><strong>{r.display_name}</strong>{i < 10 && <small>Top 10</small>}</span><span className="streak"><Flame size={15}/>{r.streak}</span><span className="pts">{r.points} pts</span></li>)}</ol>
  </main></PageShell>;
}
