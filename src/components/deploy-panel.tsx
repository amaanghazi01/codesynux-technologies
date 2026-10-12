import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Copy, ExternalLink, Loader2, Rocket, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Site = { id: string; slug: string; title: string; deploys: number; updated_at: string };
const STUDIO = "codesynux-studio";

function studioHtml(): string | null {
  try {
    const s = localStorage.getItem(STUDIO);
    if (!s) return null;
    const c = JSON.parse(s) as { html: string; css: string; js: string };
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${c.css}</style></head><body>${c.html}<script>${c.js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  } catch { return null; }
}

export function DeployPanel() {
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [sites, setSites] = useState<Site[]>([]);
  const [title, setTitle] = useState("My website");
  const [slug, setSlug] = useState("");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  const load = async () => {
    const { data } = await supabase.from("hosted_sites").select("id,slug,title,deploys,updated_at").order("updated_at", { ascending: false });
    setSites(data ?? []);
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null;
      setUser(id);
      if (id) supabase.from("hosted_sites").select("id,slug,title,deploys,updated_at").eq("user_id", id).order("updated_at", { ascending: false }).then(r => setSites(r.data ?? []));
    });
  }, []);

  const deploy = async (): Promise<void> => {
    const s = slug.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(s)) { toast.error("Address: 3–40 lowercase letters, numbers or dashes."); return; }
    if (!html.trim()) { toast.error("Add your website code first."); return; }
    setBusy(true); setSteps(["Checking code…"]);
    const existing = sites.find(x => x.slug === s);
    const res = existing
      ? await supabase.from("hosted_sites").update({ html, title, deploys: existing.deploys + 1, updated_at: new Date().toISOString() }).eq("id", existing.id)
      : await supabase.from("hosted_sites").insert({ slug: s, title, html });
    if (res.error) {
      setBusy(false); setSteps([]);
      toast.error(res.error.code === "23505" ? "That address is taken. Try another." : res.error.code === "42501" ? "Limit reached: 10 sites per account." : "Deploy failed. Please try again.");
      return;
    }
    setSteps(["Checking code…", "Uploading to Codesynux Server…", "Live worldwide ✓"]);
    setBusy(false); toast.success("Your website is live!");
    if (user) { const r = await supabase.from("hosted_sites").select("id,slug,title,deploys,updated_at").eq("user_id", user).order("updated_at", { ascending: false }); setSites(r.data ?? []); } else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Take this website offline?")) return;
    await supabase.from("hosted_sites").delete().eq("id", id);
    setSites(x => x.filter(s => s.id !== id));
  };
  const link = (s: string) => `${window.location.origin}/s/${s}`;

  if (user === undefined) return null;
  if (!user) return <section id="deploy" className="deploy-panel"><h2><Rocket size={20} /> Deploy a website</h2><p>Sign in to put your website live on Codesynux Server.</p><Button asChild><Link to="/auth">Sign in</Link></Button></section>;

  return <section id="deploy" className="deploy-panel" aria-label="Deploy a website">
    <h2><Rocket size={20} /> Deploy a website</h2>
    <p>Paste a single-page website (HTML with its CSS and JavaScript) or import it from Code Studio. It goes live instantly at its own address.</p>
    <div className="deploy-form">
      <label>Site name<input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} /></label>
      <label>Address<div className="deploy-slug"><span>/s/</span><input value={slug} placeholder="my-site" onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} /></div></label>
      <label className="deploy-code">Website code<textarea value={html} rows={8} placeholder="<!doctype html>…" onChange={e => setHtml(e.target.value)} /></label>
      <div className="deploy-actions">
        <Button type="button" variant="outline" onClick={() => { const h = studioHtml(); if (h) { setHtml(h); toast.success("Imported from Code Studio"); } else toast.error("Nothing saved in Code Studio yet."); }}><Upload size={16} /> Import from Code Studio</Button>
        <Button type="button" onClick={deploy} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />} Deploy</Button>
      </div>
      {steps.length > 0 && <ol className="deploy-steps" aria-live="polite">{steps.map(s => <li key={s}><CheckCircle2 size={14} /> {s}</li>)}</ol>}
    </div>
    <h3>Your live websites</h3>
    {sites.length === 0 ? <p className="deploy-empty">No websites deployed yet.</p> : <ul className="deploy-list">{sites.map(s => <li key={s.id}>
      <div><span className="sl-dot" /> <strong>{s.title}</strong><small>/s/{s.slug} · {s.deploys} deploy{s.deploys > 1 ? "s" : ""} · {new Date(s.updated_at).toLocaleString()}</small></div>
      <div className="deploy-row-actions">
        <Button size="icon" variant="ghost" aria-label="Open site" asChild><a href={`/s/${s.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a></Button>
        <Button size="icon" variant="ghost" aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(link(s.slug)); toast.success("Link copied"); }}><Copy size={16} /></Button>
        <Button size="icon" variant="ghost" aria-label="Take offline" onClick={() => remove(s.id)}><Trash2 size={16} /></Button>
        <Button size="sm" variant="outline" onClick={() => { setSlug(s.slug); setTitle(s.title); document.getElementById("deploy")?.scrollIntoView({ behavior: "smooth" }); }}>Redeploy</Button>
      </div>
    </li>)}</ul>}
  </section>;
}
