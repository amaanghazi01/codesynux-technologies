import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Columns2, Download, Laptop, RotateCcw, Smartphone, Sparkles, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

const CodeEditor = lazy(() => import("@/components/code-editor"));

export const Route = createFileRoute("/ide")({
  head: () => ({ meta: [
    { title: "Codesynux Studio — Code editor with live preview" },
    { name: "description", content: "Write HTML, CSS and JavaScript in the browser and see your project live, side by side, on phone, tablet or laptop sizes." },
    { property: "og:title", content: "Codesynux Studio — Code editor with live preview" },
    { property: "og:description", content: "A built-in code editor with side-by-side live preview." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Studio,
});

type Lang = "html" | "css" | "js";
const STORE = "codesynux-studio";
const starter: Record<Lang, string> = {
  html: `<main>\n  <h1>Hello from Codesynux</h1>\n  <p>Edit the code and watch this preview update.</p>\n  <button id="btn">Click me</button>\n</main>`,
  css: `body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fafafa; }\nmain { text-align: center; }\nbutton { padding: .7rem 1.4rem; border-radius: 999px; border: 0; background: #111; color: #fff; cursor: pointer; }`,
  js: `document.getElementById("btn").addEventListener("click", () => {\n  alert("It works!");\n});`,
};
const sizes = [
  { id: "phone", icon: Smartphone, w: 390 },
  { id: "tablet", icon: Tablet, w: 768 },
  { id: "laptop", icon: Laptop, w: 0 },
] as const;

function Studio() {
  const [code, setCode] = useState(starter);
  const [tab, setTab] = useState<Lang>("html");
  const [size, setSize] = useState<(typeof sizes)[number]["id"]>("laptop");
  const [split, setSplit] = useState(true);
  const [doc, setDoc] = useState("");

  useEffect(() => { try { const s = localStorage.getItem(STORE); if (s) setCode(JSON.parse(s)); } catch { /* ignore */ } }, []);
  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(code));
    const t = setTimeout(() => setDoc(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${code.css}</style></head><body>${code.html}<script>${code.js.replace(/<\/script>/gi, "<\\/script>")}<\/script></body></html>`), 300);
    return () => clearTimeout(t);
  }, [code]);
  const width = useMemo(() => sizes.find(s => s.id === size)!.w, [size]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    const a = document.createElement("a"); a.href = url; a.download = "index.html"; a.click(); URL.revokeObjectURL(url);
  };

  return <PageShell><main className="mx-auto flex h-[calc(100dvh-64px)] max-w-[1600px] flex-col gap-3 px-3 py-3 md:px-5">
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="mr-auto text-xl font-semibold tracking-tight">Codesynux Studio</h1>
      {sizes.map(s => <Button key={s.id} size="icon" variant={size === s.id ? "default" : "outline"} className="rounded-full" aria-label={`${s.id} preview`} onClick={() => setSize(s.id)}><s.icon /></Button>)}
      <Button size="icon" variant={split ? "default" : "outline"} className="hidden rounded-full md:inline-flex" aria-label="Side by side" onClick={() => setSplit(!split)}><Columns2 /></Button>
      <Button size="icon" variant="outline" className="rounded-full" aria-label="Reset code" onClick={() => setCode(starter)}><RotateCcw /></Button>
      <Button size="icon" variant="outline" className="rounded-full" aria-label="Download" onClick={download}><Download /></Button>
      <Button asChild className="rounded-full"><Link to="/ai"><Sparkles /> Ask AI</Link></Button>
    </div>
    <div className={`grid min-h-0 flex-1 gap-3 ${split ? "md:grid-cols-2" : ""} grid-rows-2 md:grid-rows-1`}>
      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex gap-1 border-b border-border p-2">{(["html", "css", "js"] as Lang[]).map(l => <button key={l} onClick={() => setTab(l)} className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${tab === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>)}</div>
        <div className="min-h-0 flex-1 overflow-auto">
          <ClientOnly fallback={<p className="p-4 text-sm text-muted-foreground">Loading editor…</p>}>
            <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Loading editor…</p>}>
              <CodeEditor key={tab} lang={tab} value={code[tab]} onChange={v => setCode(c => ({ ...c, [tab]: v }))} />
            </Suspense>
          </ClientOnly>
        </div>
      </section>
      <section className={`min-h-0 overflow-auto rounded-2xl border border-border bg-secondary p-2 ${split ? "" : "hidden"}`}>
        <iframe title="Live preview" srcDoc={doc} sandbox="allow-scripts allow-modals" style={{ width: width || "100%", maxWidth: width ? "none" : "100%" }} className="mx-auto block h-full rounded-xl border border-border bg-background" />
      </section>
    </div>
  </main></PageShell>;
}
