import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { ExternalLink, FolderKanban, Laptop, Loader2, MessageSquare, Monitor, Phone, Rocket, Smartphone, Tablet, Video, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputTools, PromptInputButton } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { SendControl } from "@/components/ai/workspace-files";
import { CallView } from "@/components/ai/call-view";
import { deployProject, extractHtml, type AIProject } from "@/lib/ai/projects";

export const Route = createFileRoute("/ai_/project/$id")({
  head: () => ({
    meta: [
      { title: "Project — Codesynux AI" },
      { name: "description", content: "Build a website with Codesynux AI and watch the live preview update as you chat." },
      { property: "og:title", content: "Project — Codesynux AI" },
      { property: "og:description", content: "Chat, build, preview and deploy in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<AIProject | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return setProject(null);
      const { data: row } = await supabase.from("ai_projects").select("*").eq("id", id).maybeSingle();
      setProject((row as AIProject | null) ?? null);
    });
  }, [id]);
  if (project === undefined) return <div className="grid min-h-dvh place-items-center bg-background"><Shimmer>Opening your project…</Shimmer></div>;
  if (project === null) return (
    <div className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="space-y-3"><p>This project isn’t available. Sign in or open another project.</p>
        <Button asChild className="rounded-full"><Link to="/ai">Back to Codesynux AI</Link></Button></div>
    </div>
  );
  return <Workspace initial={project} />;
}

const sizes = { phone: 390, tablet: 768, laptop: 0 } as const;

function Workspace({ initial }: { initial: AIProject }) {
  const [project, setProject] = useState(initial);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"chat" | "preview">("chat");
  const [size, setSize] = useState<keyof typeof sizes>("laptop");
  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  const [rename, setRename] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const voice = typeof window !== "undefined" ? localStorage.getItem("csx-voice") ?? "marin" : "marin";
  const language = typeof window !== "undefined" ? localStorage.getItem("csx-language") ?? "auto" : "auto";

  useEffect(() => {
    if (!project.site_id) return;
    supabase.from("hosted_sites").select("slug").eq("id", project.site_id).maybeSingle().then(({ data }) => setSlug(data?.slug ?? null));
  }, [project.site_id]);
  useEffect(() => { document.documentElement.classList.toggle("dark", localStorage.getItem("csx-theme") === "dark"); }, []);

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/project-chat",
    headers: async (): Promise<Record<string, string>> => {
      const { data } = await supabase.auth.getSession();
      return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
    },
  }), []);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: project.id,
    messages: (Array.isArray(project.messages) ? project.messages : []) as UIMessage[],
    transport,
    onFinish: async () => {
      const { data } = await supabase.from("ai_projects").select("*").eq("id", project.id).maybeSingle();
      if (!data) return;
      const next = data as AIProject;
      setProject(next);
      if (next.auto_deploy && next.site_id && next.html) {
        try { await deployProject(next); toast.success("Live website updated automatically"); } catch { /* shown on manual deploy */ }
      }
    },
  });
  const busy = status === "submitted" || status === "streaming";
  const lastText = messages.filter(m => m.role === "assistant").at(-1)?.parts.map(p => (p.type === "text" ? p.text : "")).join("") ?? "";
  const liveHtml = (busy ? null : extractHtml(lastText)) ?? project.html;

  const send = async (value: string) => {
    if (!value.trim() || busy) return;
    setText("");
    await sendMessage({ text: value.trim() }, { body: { language, mode: "code" } });
  };
  const deploy = async () => {
    setDeploying(true);
    try {
      const s = await deployProject({ ...project, html: liveHtml });
      setSlug(s);
      const { data } = await supabase.from("ai_projects").select("*").eq("id", project.id).maybeSingle();
      if (data) setProject(data as AIProject);
      toast.success("Your website is live!", { action: { label: "Open", onClick: () => window.open(`/s/${s}`, "_blank") } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deploy failed.");
    } finally { setDeploying(false); }
  };
  const saveName = async () => {
    const name = rename?.trim();
    if (!name) return;
    await supabase.from("ai_projects").update({ name: name.slice(0, 60) }).eq("id", project.id);
    setProject(p => ({ ...p, name: name.slice(0, 60) }));
    setRename(null);
  };
  const toggleAuto = async (v: boolean) => {
    setProject(p => ({ ...p, auto_deploy: v }));
    await supabase.from("ai_projects").update({ auto_deploy: v }).eq("id", project.id);
  };

  const chat = (
    <div className={`flex min-h-0 flex-col md:flex md:w-[420px] md:shrink-0 md:border-r md:border-border/60 ${tab === "chat" ? "flex flex-1" : "hidden"}`}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="px-4">
          {!messages.length ? (
            <ConversationEmptyState className="py-10">
              <FolderKanban className="mb-2 size-9 text-primary" strokeWidth={1.5} />
              <h2 className="text-center text-xl font-semibold">What shall we build?</h2>
              <p className="max-w-xs text-center text-sm text-muted-foreground">Describe your website. Codesynux AI names the project, writes the code and the preview updates on its own.</p>
              <div className="mt-4 grid w-full gap-2">
                {["A landing page for my bakery", "A personal portfolio with projects", "A to-do app with dark mode"].map(t => (
                  <Button key={t} variant="outline" className="h-auto justify-start whitespace-normal rounded-lg py-3 text-left" onClick={() => void send(t)}>{t}</Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : messages.map((m, i) => (
            <Message from={m.role} key={m.id}>
              <MessageContent className={m.role === "user" ? "rounded-2xl bg-foreground px-4 py-2.5 text-background" : "bg-transparent px-0"}>
                {m.parts.map((p, j) => p.type !== "text" ? null : m.role === "assistant"
                  ? <MessageResponse key={j} isAnimating={busy && i === messages.length - 1}>{p.text.replace(/```html[\s\S]*?(```|$)/gi, "\n_✓ Website code updated — see the preview._\n")}</MessageResponse>
                  : <span key={j} className="whitespace-pre-wrap break-words">{p.text}</span>)}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
          {status === "streaming" && <Shimmer>Building your website…</Shimmer>}
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error.message || "Your answer could not be completed."}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <PromptInput onSubmit={({ text: v }) => send(v)} className="[&>div]:rounded-2xl">
          <PromptInputTextarea value={text} onChange={e => setText(e.target.value)} placeholder="Describe a change…" className="min-h-20" />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton aria-label="Voice call" tooltip="Voice call" onClick={() => setCallMode("voice")}><Phone /></PromptInputButton>
              <PromptInputButton aria-label="Face to face" tooltip="Face to face" onClick={() => setCallMode("video")}><Video /></PromptInputButton>
            </PromptInputTools>
            <SendControl status={status} stop={stop} text={text} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );

  const preview = (
    <div className={`min-h-0 flex-1 flex-col bg-muted/40 md:flex ${tab === "preview" ? "flex" : "hidden"}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex gap-1" role="group" aria-label="Preview size">
          {([["phone", Smartphone], ["tablet", Tablet], ["laptop", Laptop]] as const).map(([k, Icon]) => (
            <Button key={k} size="icon" variant={size === k ? "secondary" : "ghost"} className="size-8" aria-label={`${k} size`} aria-pressed={size === k} onClick={() => setSize(k)}><Icon className="size-4" /></Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">Auto-deploy<Switch checked={project.auto_deploy} onCheckedChange={v => void toggleAuto(v)} disabled={!project.site_id} aria-label="Auto-deploy changes" /></label>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-3">
        {liveHtml ? (
          <iframe title="Project preview" sandbox="allow-scripts allow-forms allow-modals" srcDoc={liveHtml}
            className="h-full rounded-xl border border-border bg-white shadow-sm transition-all"
            style={{ width: sizes[size] ? `${sizes[size]}px` : "100%", maxWidth: "100%" }} />
        ) : (
          <div className="grid h-full w-full place-items-center text-center text-sm text-muted-foreground">
            <div className="space-y-2"><Monitor className="mx-auto size-8" strokeWidth={1.4} /><p>Your live preview appears here after the first build.</p></div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-2 py-2 sm:px-4">
        <Button asChild variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="Close project"><Link to="/ai"><X /></Link></Button>
        <button type="button" onClick={() => setRename(project.name)} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted" aria-label={`Project ${project.name}. Rename`}>
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><FolderKanban className="size-4" /></span>
          <span className="truncate text-sm font-semibold">{project.name}</span>
          <Pencil className="size-3 shrink-0 text-muted-foreground" />
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="flex rounded-full bg-muted p-0.5 md:hidden">
            <Button size="sm" variant={tab === "chat" ? "secondary" : "ghost"} className="h-8 rounded-full px-3" onClick={() => setTab("chat")} aria-label="Chat"><MessageSquare className="size-4" /></Button>
            <Button size="sm" variant={tab === "preview" ? "secondary" : "ghost"} className="h-8 rounded-full px-3" onClick={() => setTab("preview")} aria-label="Preview"><Monitor className="size-4" /></Button>
          </div>
          {slug && <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Open live website"><a href={`/s/${slug}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button>}
          <Button size="sm" className="rounded-full" onClick={() => void deploy()} disabled={deploying || busy}>
            {deploying ? <Loader2 className="animate-spin" /> : <Rocket />}<span className="hidden sm:inline">{slug ? "Redeploy" : "Deploy"}</span>
          </Button>
        </div>
      </header>
      <main className="flex min-h-0 flex-1">{chat}{preview}</main>
      <Dialog open={rename !== null} onOpenChange={o => !o && setRename(null)}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-xl" aria-describedby={undefined}>
          <DialogTitle>Project name</DialogTitle>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); void saveName(); }}>
            <Input value={rename ?? ""} onChange={e => setRename(e.target.value)} maxLength={60} autoFocus aria-label="Project name" />
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setRename(null)}>Cancel</Button><Button type="submit" disabled={!rename?.trim()}>Save</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      {callMode && <CallView mode={callMode} voice={voice} onVoice={v => localStorage.setItem("csx-voice", v)} onClose={() => setCallMode(null)} />}
    </div>
  );
}
