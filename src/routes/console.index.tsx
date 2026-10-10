import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, FolderKanban, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { ConsoleGate } from "@/components/console-gate";
import { supabase } from "@/integrations/supabase/client";
import { phases, projectKinds } from "@/lib/console";

export const Route = createFileRoute("/console/")({
  head: () => ({ meta: [
    { title: "Console — Codesynux" },
    { name: "description", content: "Manage projects, teams, previews and every phase from research to maintenance in the Codesynux Console." },
    { property: "og:title", content: "Console — Codesynux" },
    { property: "og:description", content: "One powerful dashboard for building, launching and maintaining projects with your team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <ConsoleGate>{() => <ConsoleHome />}</ConsoleGate>,
});

type Project = { id: string; name: string; kind: string; phase: string; updated_at: string };

function ConsoleHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>(projectKinds[0]!);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.from("console_projects").select("id,name,kind,phase,updated_at").order("updated_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error("Couldn't load projects."); setProjects(data ?? []);
    });
  }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return; setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("console_projects").insert({ name: name.trim(), kind, owner_id: u.user!.id }).select("id").single();
    setBusy(false);
    if (error || !data) { toast.error("Couldn't create the project."); return; }
    navigate({ to: "/console/$projectId", params: { projectId: data.id } });
  };
  return <PageShell><main className="mx-auto max-w-5xl px-5 py-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="section-index">Console / Dashboard</p><h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Everything in one place.</h1><p className="mt-2 text-muted-foreground">Research, plan, code, test, deploy and maintain — together with your team.</p></div>
      <Button size="lg" className="rounded-full" onClick={() => setOpen(true)}><Plus /> New project</Button>
    </div>
    {open && <form onSubmit={create} className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Start a new project</h2>
      <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3" />
      <div className="mt-4 flex flex-wrap gap-2">{projectKinds.map(k => <button type="button" key={k} onClick={() => setKind(k)} className={`rounded-full border px-4 py-2 text-sm ${kind === k ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{k}</button>)}</div>
      <div className="mt-5 flex gap-2"><Button type="submit" disabled={busy || !name.trim()} className="rounded-full">{busy ? "Creating…" : "Create and open"}</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>}
    <section className="mt-10">
      {projects === null ? <p className="text-muted-foreground">Loading projects…</p> : projects.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-12 text-center"><FolderKanban className="mx-auto size-10 text-muted-foreground" strokeWidth={1.4} /><p className="mt-3 font-medium">No projects yet.</p><p className="text-sm text-muted-foreground">Start one to bring your team, previews and launch plan together.</p></div> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projects.map(p => <Link key={p.id} to="/console/$projectId" params={{ projectId: p.id }} className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md"><p className="text-xs text-muted-foreground">{p.kind}</p><h3 className="mt-1 text-lg font-semibold">{p.name}</h3><p className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs">{phases.find(f => f.id === p.phase)?.label ?? p.phase}</p></Link>)}</div>}
    </section>
    <Link to="/ai" className="text-action mt-10 inline-flex items-center gap-2"><Sparkles size={16} /> Open AI Experience</Link>
  </main></PageShell>;
}
