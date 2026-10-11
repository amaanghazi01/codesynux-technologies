import { useState } from "react";
import { ExternalLink, Laptop, MonitorPlay, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const sizes = [
  { id: "phone", label: "Phone", icon: Smartphone, w: 390 },
  { id: "tablet", label: "Tablet", icon: Tablet, w: 768 },
  { id: "laptop", label: "Laptop", icon: Laptop, w: 1280 },
] as const;

export function ProjectPreview({ url: initial, variant = "icon" }: { url?: string | null; variant?: "icon" | "button" }) {
  const [url, setUrl] = useState(initial ?? "");
  const [draft, setDraft] = useState(initial ?? "");
  const [size, setSize] = useState<(typeof sizes)[number]["id"]>("phone");
  const width = sizes.find(s => s.id === size)!.w;
  const valid = /^https:\/\//i.test(url);
  return <Dialog>
    <DialogTrigger asChild>
      {variant === "icon"
        ? <Button variant="ghost" size="icon" aria-label="Preview project" title="Preview project"><MonitorPlay /></Button>
        : <Button variant="outline" className="rounded-full"><MonitorPlay /> Preview</Button>}
    </DialogTrigger>
    <DialogContent className="max-w-[min(96vw,1340px)] p-4">
      <DialogHeader><DialogTitle>Project preview</DialogTitle></DialogHeader>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); setUrl(draft.trim()); }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="https://your-project.app" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <Button type="submit" variant="outline">Open</Button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        {sizes.map(s => <Button key={s.id} size="sm" variant={size === s.id ? "default" : "outline"} className="rounded-full" onClick={() => setSize(s.id)}><s.icon /> {s.label}</Button>)}
        {valid && <a href={url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground"><ExternalLink size={14} /> New tab</a>}
      </div>
      <div className="h-[65vh] overflow-auto rounded-xl border border-border bg-secondary p-3">
        {valid
          ? <iframe title="Project preview" src={url} style={{ width, maxWidth: "none" }} className="mx-auto block h-full rounded-lg border border-border bg-background" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          : <p className="p-10 text-center text-sm text-muted-foreground">Paste your project's https:// link to see it as visitors will, then click through it.</p>}
      </div>
    </DialogContent>
  </Dialog>;
}
