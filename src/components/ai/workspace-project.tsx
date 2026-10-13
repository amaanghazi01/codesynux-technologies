import { useEffect, useState } from "react";
import { ChevronDown, FolderPlus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function WorkspaceProject({ conversationId }: { conversationId: string }) {
  const [name, setName] = useState("Codesynux Technologies");
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const storageKey = `csx-project-name:${conversationId}`;

  useEffect(() => {
    setName(localStorage.getItem(storageKey) || "Codesynux Technologies");
  }, [storageKey]);

  const edit = () => {
    setDraft(name === "Codesynux Technologies" ? "" : name);
    setOpen(true);
  };

  return (
    <>
      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="Name your project" title="Name your project" onClick={edit}>
          <FolderPlus strokeWidth={1.7} />
        </Button>
        <Button variant="ghost" className="min-w-0 gap-2 px-2 text-sm font-semibold sm:text-base" aria-label={`Project: ${name}. Edit name`} title={name} onClick={edit}>
          <h1 className="truncate">{name}</h1>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-lg" aria-describedby={undefined}>
          <DialogTitle className="flex items-center gap-2"><Pencil className="size-4 text-muted-foreground" />Project name</DialogTitle>
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            const next = draft.trim();
            if (!next) return;
            localStorage.setItem(storageKey, next);
            setName(next);
            setOpen(false);
          }}>
            <label htmlFor="workspace-project-name" className="text-sm font-medium">Name</label>
            <Input id="workspace-project-name" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={80} placeholder="Your project name" autoFocus />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!draft.trim()}><Check className="size-4" />Save name</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}