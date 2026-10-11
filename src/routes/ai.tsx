import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Home, Mic, Moon, PanelLeft, Phone, RotateCcw, Sun, Trash2, Video, X, Code2, Search, Lightbulb, CircleUserRound, LayoutDashboard, Server } from "lucide-react";
import { PointsBadge } from "@/components/ai/points-badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { loadConversation, clearConversation } from "@/lib/ai/conversation.functions";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputTools, PromptInputButton, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CallView } from "@/components/ai/call-view";
import mark from "@/assets/codesynux-mark.png.asset.json";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Codesynux AI Experience — Chat, voice and build" },
      { name: "description", content: "Talk, research, plan and build software with Codesynux AI by chat, live voice or face to face." },
      { property: "og:title", content: "Codesynux AI Experience" },
      { property: "og:description", content: "One ongoing AI conversation for life, research and development — with live voice calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuth(data.session ? "in" : "out"));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuth(s ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, []);
  if (auth === "loading") return <div className="grid min-h-dvh place-items-center bg-background"><Shimmer>Opening Codesynux AI…</Shimmer></div>;
  if (auth === "out") return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 text-center text-foreground">
      <div className="max-w-sm space-y-4">
        <img src={mark.url} alt="" width={48} height={48} className="mx-auto" />
        <h1 className="text-3xl font-semibold tracking-tight">Codesynux AI Experience</h1>
        <p className="text-muted-foreground">Sign in to start your conversation. It’s saved privately to your account.</p>
        <Button asChild size="lg" className="rounded-full"><Link to="/auth">Sign in</Link></Button>
        <p><Link to="/" className="text-sm text-muted-foreground underline">Back to home</Link></p>
      </div>
    </div>
  );
  return <Workspace />;
}

function Workspace() {
  const load = useServerFn(loadConversation);
  const [data, setData] = useState<{ id: string; messages: UIMessage[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    load().then((r) => setData({ id: r.id, messages: JSON.parse(r.messages) as UIMessage[] })).catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load"));
  }, [load]);
  if (loadError) return <div className="grid min-h-dvh place-items-center bg-background p-6 text-center text-destructive">{loadError}</div>;
  if (!data) return <div className="grid min-h-dvh place-items-center bg-background"><Shimmer>Loading your conversation…</Shimmer></div>;
  return <Chat id={data.id} initial={data.messages} />;
}

const starters = [
  { icon: Code2, text: "Help me design a scalable web app architecture" },
  { icon: Search, text: "Research the latest trends in cloud security" },
  { icon: Lightbulb, text: "Plan a 30-day roadmap to learn TypeScript" },
];

type SpeechRec = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

function Chat({ id, initial }: { id: string; initial: UIMessage[] }) {
  const clear = useServerFn(clearConversation);
  const [sidebar, setSidebar] = useState(false);
  const [dark, setDark] = useState(false);
  const [voice, setVoice] = useState("marin");
  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    setDark(localStorage.getItem("csx-theme") === "dark");
    setVoice(localStorage.getItem("csx-voice") ?? "marin");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("csx-theme", dark ? "dark" : "light");
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);
  useEffect(() => localStorage.setItem("csx-voice", voice), [voice]);

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    headers: async (): Promise<Record<string, string>> => {
      const { data } = await supabase.auth.getSession();
      return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
    },
  }), []);
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = useChat({ id, messages: initial, transport });

  const send = (value: string) => {
    const t = value.trim();
    if (!t || status === "submitted" || status === "streaming") return;
    void sendMessage({ text: t });
    setText("");
  };

  const toggleDictation = () => {
    if (listening) { recRef.current?.stop(); return; }
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) { alert("Dictation isn’t supported in this browser. Try the voice call instead."); return; }
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    const base = text ? text + " " : "";
    rec.onresult = (e) => setText(base + Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(""));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const onClear = async () => {
    if (!confirm("Clear your whole conversation? This can’t be undone.")) return;
    await clear();
    setMessages([]);
    setSidebar(false);
  };

  const busy = status === "submitted" || status === "streaming";
  return (
    <div className="flex h-dvh bg-background text-foreground">
      {sidebar && <div className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setSidebar(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-muted/60 backdrop-blur-xl transition-transform md:static md:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"} md:bg-muted/40`}>
        <div className="flex items-center justify-between p-4">
          <Link to="/" aria-label="Codesynux home"><img src={mark.url} alt="" width={30} height={30} className="dark:invert" /></Link>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Close sidebar" onClick={() => setSidebar(false)}><X /></Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 text-sm">
          <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Your conversation</p>
          <Button variant="ghost" className="justify-start" onClick={() => setSidebar(false)}>Codesynux AI</Button>
          <Button variant="ghost" className="justify-start" onClick={() => { setCallMode("voice"); setSidebar(false); }}><Phone /> Voice call</Button>
          <Button variant="ghost" className="justify-start" onClick={() => { setCallMode("video"); setSidebar(false); }}><Video /> Face to face</Button>
          <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground">Settings</p>
          <Button variant="ghost" className="justify-start" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />} {dark ? "Light appearance" : "Dark appearance"}</Button>
          <label className="flex items-center justify-between gap-2 px-3 py-2">
            <span>Voice</span>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 capitalize">
              {["marin", "gleam", "meridian", "quartz", "ripple", "vesper", "willow", "stone", "delta", "cinder"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={onClear} disabled={!messages.length}><Trash2 /> Clear conversation</Button>
        </nav>
        <div className="space-y-1 border-t border-border p-3 text-sm">
          <Button asChild variant="ghost" className="w-full justify-start"><Link to="/"><Home /> Codesynux home</Link></Button>
          <Button asChild variant="ghost" className="w-full justify-start"><Link to="/account" search={{ view: "account" }}><CircleUserRound /> Account</Link></Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open sidebar" onClick={() => setSidebar(true)}><PanelLeft /></Button>
            <h1 className="px-2 text-base font-semibold">Codesynux AI</h1>
          </div>
          <div className="flex items-center gap-1">
            <PointsBadge refreshKey={messages.length} />
            <Button asChild variant="ghost" size="icon" aria-label="Open Codesynux Server" title="Codesynux Server"><Link to="/cloud-infrastructure"><Server /></Link></Button>
            <Button asChild variant="ghost" size="icon" aria-label="Open Console"><Link to="/console"><LayoutDashboard /></Link></Button>
            <Button variant="ghost" size="icon" aria-label="Start voice call" onClick={() => setCallMode("voice")}><Phone /></Button>
            <Button variant="ghost" size="icon" aria-label="Start face-to-face call" onClick={() => setCallMode("video")}><Video /></Button>
          </div>
        </header>

        <Conversation className="flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4">
            {messages.length === 0 ? (
              <ConversationEmptyState className="min-h-[50vh]">
                <img src={mark.url} alt="" width={44} height={44} className="dark:invert" />
                <h2 className="text-2xl font-semibold tracking-tight">What can I help with?</h2>
                <p className="max-w-sm text-sm text-muted-foreground">Chat about life, research, planning or code — or start a voice or face-to-face call.</p>
                <div className="mt-2 grid w-full max-w-md gap-2">
                  {starters.map(({ icon: Icon, text: t }) => (
                    <Button key={t} variant="outline" className="h-auto justify-start whitespace-normal rounded-2xl py-3 text-left" onClick={() => send(t)}><Icon /> {t}</Button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : messages.map((m, i) => (
              <Message from={m.role} key={m.id}>
                <MessageContent className={m.role === "user" ? "rounded-3xl bg-foreground px-4 py-2.5 text-background" : "bg-transparent px-0"}>
                  {m.parts.map((p, j) => p.type === "text" ? (m.role === "assistant" ? <MessageResponse key={j} isAnimating={busy && i === messages.length - 1}>{p.text}</MessageResponse> : <span key={j} className="whitespace-pre-wrap">{p.text}</span>) : null)}
                </MessageContent>
                {m.role === "assistant" && !(busy && i === messages.length - 1) && (
                  <MessageActions>
                    <MessageAction tooltip="Copy" label="Copy" onClick={() => navigator.clipboard.writeText(m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""))}><Copy className="size-4" /></MessageAction>
                    {i === messages.length - 1 && <MessageAction tooltip="Regenerate" label="Regenerate" onClick={() => regenerate()}><RotateCcw className="size-4" /></MessageAction>}
                  </MessageActions>
                )}
              </Message>
            ))}
            {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error.message || "Something went wrong."}{" "}
                <button className="underline" onClick={() => regenerate()}>Try again</button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto w-full max-w-3xl px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          <PromptInput onSubmit={() => send(text)} className="rounded-3xl">
            <PromptInputBody>
              <PromptInputTextarea value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening…" : "Ask Codesynux AI"} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton aria-label={listening ? "Stop dictation" : "Dictate"} variant={listening ? "secondary" : "ghost"} onClick={toggleDictation}><Mic className={listening ? "animate-pulse" : ""} /></PromptInputButton>
                <PromptInputButton aria-label="Voice call" onClick={() => setCallMode("voice")}><Phone /></PromptInputButton>
                <PromptInputButton aria-label="Face to face" onClick={() => setCallMode("video")}><Video /></PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} className="rounded-full" />
            </PromptInputFooter>
          </PromptInput>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">Codesynux AI can make mistakes. Check important information.</p>
        </div>
      </main>

      {callMode && <CallView mode={callMode} voice={voice} onVoice={setVoice} onClose={() => setCallMode(null)} />}
    </div>
  );
}
