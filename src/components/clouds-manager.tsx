import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, FolderOpen, Github, History, Loader2, RefreshCw, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Site = { id: string; slug: string; title: string; deploys: number; created_at: string; updated_at: string };
type Proj = { id: string; site_id: string | null; html: string };

export function CloudsSettings() {
  const items = [
    { name: "GitHub", note: "Import and sync repositories", icon: <Github size={18} /> },
    { name: "Vercel", note: "Deploy to Vercel", icon: <span className="font-bold">▲</span> },
    { name: "Netlify", note: "Deploy to Netlify", icon: <span className="font-bold">N</span> },
    { name: "Cloudflare", note: "Edge hosting", icon: <span className="font-bold">☁</span> },
  ];
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" size="icon" className="rounded-full" aria-label="Clouds settings"><Settings size={18} /></Button></DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Clouds settings</DialogTitle><DialogDescription>Connectors for importing and publishing your projects.</DialogDescription></DialogHeader>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connectors</p>
      <ul className="grid gap-2">{items.map(i => <li key={i.name} className="flex items-center gap-3 rounded-xl border p-3">
        <span className="grid size-9 place-items-center rounded-full bg-muted">{i.icon}</span>
        <div className="min-w-0 flex-1"><p className="text-sm font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.note}</p></div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Coming soon</span>
      </li>)}</ul>
    </DialogContent>
  </Dialog>;
}

export function CloudsManager() {
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Proj[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Site | null>(null);

  const load = async (id: string) => {
    const [s, p] = await Promise.all([
      supabase.from("hosted_sites").select("id,slug,title,deploys,created_at,updated_at").eq("user_id", id).order("updated_at", { ascending: false }),
      supabase.from("ai_projects").select("id,site_id,html").not("site_id", "is", null),
    ]);
    setSites(s.data ?? []); setProjects(p.data ?? []);
  };
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { const id = data.session?.user.id ?? null; setUser(id); if (id) void load(id); }); }, []);

  const redeploy = async (s: Site) => {
    const p = projects.find(x => x.site_id === s.id);
    setBusy(s.id);
    const { error } = await supabase.from("hosted_sites").update({ ...(p?.html ? { html: p.html } : {}), deploys: s.deploys + 1, updated_at: new Date().toISOString() }).eq("id", s.id);
    setBusy(null);
    if (error) { toast.error("Redeploy failed. Please try again."); return; }
    toast.success(p ? "Redeployed with the latest project changes" : "Redeployed");
    if (user) void load(user);
  };
  const takeDown = async () => {
    if (!removing) return;
    const { error } = await supabase.from("hosted_sites").delete().eq("id", removing.id);
    if (error) toast.error("Could not take the website down."); else { setSites(x => x.filter(y => y.id !== removing.id)); toast.success("Website taken down"); }
    setRemoving(null);
  };

  if (user === undefined) return null;
  if (!user) return <section className="clouds-manage"><h2>Your deployments</h2><p className="deploy-empty">Sign in to manage your live websites.</p><Button asChild><Link to="/auth">Sign in</Link></Button></section>;

  return <section className="clouds-manage" aria-labelledby="manage-title">
    <div className="flex items-center justify-between gap-3"><h2 id="manage-title">Your deployments</h2><CloudsSettings /></div>
    {sites.length === 0 ? <p className="deploy-empty">Nothing deployed yet. Tap “Deploy new project” to start.</p> : <ul className="grid gap-3">{sites.map(s => {
      const p = projects.find(x => x.site_id === s.id);
      const url = `${window.location.origin}/s/${s.slug}`;
      return <li key={s.id} className="rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />Live</span><strong className="truncate">{s.title}</strong></div>
        <a href={`/s/${s.slug}`} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-muted-foreground underline-offset-4 hover:underline">{url}</a>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><History size={13} /> {s.deploys} deploy{s.deploys > 1 ? "s" : ""} · first {new Date(s.created_at).toLocaleDateString()} · latest {new Date(s.updated_at).toLocaleString()}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild><a href={`/s/${s.slug}`} target="_blank" rel="noreferrer"><ExternalLink /> Open</a></Button>
          <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(url); toast.success("Link copied"); }}><Copy /> Copy link</Button>
          <Button size="sm" variant="outline" onClick={() => void redeploy(s)} disabled={busy === s.id}>{busy === s.id ? <Loader2 className="animate-spin" /> : <RefreshCw />} Redeploy</Button>
          {p && <Button size="sm" variant="outline" asChild><Link to="/ai/project/$id" params={{ id: p.id }}><FolderOpen /> Open in project</Link></Button>}
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRemoving(s)}><Trash2 /> Take down</Button>
        </div>
      </li>;
    })}</ul>}
    <AlertDialog open={!!removing} onOpenChange={o => !o && setRemoving(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Take “{removing?.title}” offline?</AlertDialogTitle><AlertDialogDescription>/s/{removing?.slug} will stop working for everyone. Your project stays saved, so you can deploy it again later.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void takeDown()}>Take down</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
