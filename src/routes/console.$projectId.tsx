import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, Eye, Sparkles, Trash2, UserPlus, Users, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { ConsoleGate } from "@/components/console-gate";
import { supabase } from "@/integrations/supabase/client";
import { phases } from "@/lib/console";

export const Route = createFileRoute("/console/$projectId")({
  head: () => ({ meta: [
    { title: "Project workspace — Codesynux Console" },
    { name: "description", content: "Preview, share and manage a Codesynux project with your team." },
    { property: "og:title", content: "Project workspace — Codesynux Console" },
    { property: "og:description", content: "Preview, share and manage a project from research to maintenance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => <ConsoleGate>{() => <Workspace />}</ConsoleGate>,
});

type Project = { id: string; name: string; kind: string; phase: string; description: string; preview_url: string | null; owner_id: string };
type Member = { id: string; email: string; role: string };
type Task = { id: string; title: string; kind: string; done: boolean };
const taskKinds = [{ id: "bug", label: "Bug fix" }, { id: "feature", label: "New feature" }, { id: "upgrade", label: "Upgrade" }, { id: "task", label: "Task" }];

function Workspace() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [email, setEmail] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskKind, setTaskKind] = useState("bug");
  const load = useCallback(async () => {
    const [{ data: u }, p, m, t] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("console_projects").select("id,name,kind,phase,description,preview_url,owner_id").eq("id", projectId).maybeSingle(),
      supabase.from("console_members").select("id,email,role").eq("project_id", projectId).order("created_at"),
      supabase.from("console_tasks").select("id,title,kind,done").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);
    setMe(u.user?.id ?? null); setProject(p.data ?? null); setPreview(p.data?.preview_url ?? ""); setMembers(m.data ?? []); setTasks(t.data ?? []);
  }, [projectId]);
  useEffect(() => { load(); }, [load]);

  if (project === undefined) return <PageShell><main className="coming-main"><p className="text-muted-foreground">Loading project…</p></main></PageShell>;
  if (project === null) return <PageShell><main className="coming-main"><h1>Project not found.</h1><p>It may have been deleted, or you're not on its team.</p><Link to="/console" className="text-action">Back to Console →</Link></main></PageShell>;
  const isOwner = me === project.owner_id;

  const update = async (patch: Partial<Project>) => {
    const { error } = await supabase.from("console_projects").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", project.id);
    if (error) { toast.error("Couldn't save."); return; } setProject({ ...project, ...patch });
  };
  const savePreview = () => {
    const url = preview.trim();
    if (url && !/^https:\/\//i.test(url)) { toast.error("Use a full https:// link."); return; }
    update({ preview_url: url || null }); toast.success("Preview link saved.");
  };
  const addMember = async (e: React.FormEvent) => {
    e.preventDefault(); const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) { toast.error("Enter a valid email."); return; }
    const { error } = await supabase.from("console_members").insert({ project_id: project.id, email: value });
    if (error) { toast.error(error.code === "23505" ? "Already on the team." : "Couldn't add member."); return; }
    setEmail(""); toast.success("Added. Share the project link so they can open it."); load();
  };
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault(); if (!taskTitle.trim() || !me) return;
    const { error } = await supabase.from("console_tasks").insert({ project_id: project.id, title: taskTitle.trim(), kind: taskKind, created_by: me });
    if (error) { toast.error("Couldn't add item."); return; } setTaskTitle(""); load();
  };
  const toggleTask = async (t: Task) => { await supabase.from("console_tasks").update({ done: !t.done }).eq("id", t.id); load(); };
  const removeTask = async (t: Task) => { await supabase.from("console_tasks").delete().eq("id", t.id); load(); };
  const removeMember = async (m: Member) => { await supabase.from("console_members").delete().eq("id", m.id); load(); };
  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/console/${project.id}` : "";
  const copyShare = async () => { await navigator.clipboard.writeText(shareLink); toast.success("Project link copied."); };
  const phaseIndex = phases.findIndex(p => p.id === project.phase);
  const card = "rounded-2xl border border-border bg-card p-5";

  return <PageShell><main className="mx-auto max-w-6xl px-5 py-8">
    <Link to="/console" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft size={16} /> All projects</Link>
    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs text-muted-foreground">{project.kind}</p><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{project.name}</h1></div>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="rounded-full"><Link to="/ai"><Sparkles /> Build with AI</Link></Button>
        <Button variant="outline" className="rounded-full" onClick={copyShare}><Copy /> Share</Button>
        {project.preview_url && <Button asChild variant="outline" className="rounded-full"><a href={project.preview_url} target="_blank" rel="noreferrer"><ExternalLink /> Live preview</a></Button>}
      </div>
    </div>

    <section className={`${card} mt-6`}>
      <h2 className="font-semibold">Project phase</h2>
      <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">{phases.map((p, i) => <button key={p.id} onClick={() => update({ phase: p.id })} className={`rounded-xl border px-3 py-3 text-sm transition ${i < phaseIndex ? "border-border bg-secondary" : i === phaseIndex ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{i < phaseIndex && <Check className="mr-1 inline size-3.5" />}{p.label}</button>)}</div>
      <textarea defaultValue={project.description} onBlur={e => e.target.value !== project.description && update({ description: e.target.value })} placeholder="Goals, plan and notes for your team…" className="mt-4 min-h-24 w-full rounded-xl border border-border bg-background p-3 text-sm" />
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className={card}>
        <h2 className="flex items-center gap-2 font-semibold"><Eye size={18} /> Live preview</h2>
        <div className="mt-3 flex gap-2"><input value={preview} onChange={e => setPreview(e.target.value)} placeholder="https://your-project.app" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" /><Button variant="outline" onClick={savePreview}>Save</Button></div>
        {project.preview_url ? <iframe title="Project preview" src={project.preview_url} className="mt-4 h-[420px] w-full rounded-xl border border-border bg-background" sandbox="allow-scripts allow-same-origin allow-forms" /> : <p className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Add your project's published link to preview it here for you and your team.</p>}
      </section>
      <section className={card}>
        <h2 className="flex items-center gap-2 font-semibold"><Users size={18} /> Team</h2>
        {isOwner && <form onSubmit={addMember} className="mt-3 flex gap-2"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@email.com" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" /><Button type="submit" variant="outline" aria-label="Add teammate"><UserPlus /></Button></form>}
        <p className="mt-2 text-xs text-muted-foreground">Teammates need a Pro account and sign in with this email.</p>
        <ul className="mt-3 space-y-2 text-sm">{members.length === 0 ? <li className="text-muted-foreground">Only you so far.</li> : members.map(m => <li key={m.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2"><span className="truncate">{m.email}</span>{isOwner && <button aria-label={`Remove ${m.email}`} onClick={() => removeMember(m)}><Trash2 size={15} /></button>}</li>)}</ul>
      </section>
    </div>

    <section className={`${card} mt-6`}>
      <h2 className="flex items-center gap-2 font-semibold"><Wrench size={18} /> After launch: fixes, upgrades and new features</h2>
      <form onSubmit={addTask} className="mt-3 flex flex-wrap gap-2">
        <select value={taskKind} onChange={e => setTaskKind(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">{taskKinds.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
        <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Describe the bug, upgrade or feature" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <Button type="submit" disabled={!taskTitle.trim()}>Add</Button>
      </form>
      <ul className="mt-4 divide-y divide-border text-sm">{tasks.length === 0 ? <li className="py-3 text-muted-foreground">Nothing on the list yet.</li> : tasks.map(t => <li key={t.id} className="flex items-center gap-3 py-3">
        <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} aria-label="Mark done" className="size-4" />
        <span className={`flex-1 ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{taskKinds.find(k => k.id === t.kind)?.label}</span>
        <button aria-label="Delete" onClick={() => removeTask(t)}><Trash2 size={15} /></button>
      </li>)}</ul>
    </section>
  </main></PageShell>;
}
