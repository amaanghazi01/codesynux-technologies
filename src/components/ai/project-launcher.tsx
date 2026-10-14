import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FolderOpen, FolderPlus, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { createProject } from "@/lib/ai/projects";

type Row = { id: string; name: string; updated_at: string };

export function ProjectLauncher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const show = async () => {
    setOpen(true);
    const { data } = await supabase.from("ai_projects").select("id,name,updated_at").order("updated_at", { ascending: false }).limit(20);
    setRows(data ?? []);
  };
  const start = async () => {
    setBusy(true); setError("");
    try {
      const id = await createProject();
      await navigate({ to: "/ai/project/$id", params: { id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the project.");
      setBusy(false);
    }
  };
  return (
    <>
      <Button variant="ghost" size="icon" className="rounded-full" aria-label="Create new project" title="Create new project" onClick={() => void show()}>
        <FolderPlus strokeWidth={1.7} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogTitle>Projects</DialogTitle>
          <DialogDescription>Build a website with Codesynux AI and see it live as you go.</DialogDescription>
          <Button size="lg" className="w-full rounded-xl" onClick={() => void start()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Plus />} Create new project
          </Button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {rows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No projects yet.</p> : rows.map(r => (
              <button key={r.id} type="button" onClick={() => navigate({ to: "/ai/project/$id", params: { id: r.id } })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted">
                <FolderOpen className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
