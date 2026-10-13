import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  Mic,
  Phone,
  RotateCcw,
  Video,
  Code2,
  Compass,
  Route as RouteIcon,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { WorkspaceSettings } from "@/components/ai/workspace-settings";
import {
  AddFiles,
  ComposerFiles,
  FileStrip,
  FileViewer,
  SendControl,
} from "@/components/ai/workspace-files";
import {
  composerQuotes,
  visitQuotes,
  validateAttachments,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type WorkspaceMode,
} from "@/lib/ai/workspace-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { loadConversation, clearConversation } from "@/lib/ai/conversation.functions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CallView } from "@/components/ai/call-view";
import mark from "@/assets/codesynux-mark.png.asset.json";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Codesynux AI Experience — Chat, voice and build" },
      {
        name: "description",
        content:
          "Talk, research, plan and build software with Codesynux AI by chat, live voice or face to face.",
      },
      { property: "og:title", content: "Codesynux AI Experience" },
      {
        property: "og:description",
        content:
          "One ongoing AI conversation for life, research and development — with live voice calls.",
      },
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
  if (auth === "loading")
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Shimmer>Opening Codesynux AI…</Shimmer>
      </div>
    );
  if (auth === "out")
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 text-center text-foreground">
        <div className="max-w-sm space-y-4">
          <img src={mark.url} alt="" width={48} height={48} className="mx-auto" />
          <h1 className="text-3xl font-semibold tracking-tight">Codesynux AI Experience</h1>
          <p className="text-muted-foreground">
            Sign in to start your conversation. It’s saved privately to your account.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/auth">Sign in</Link>
          </Button>
          <p>
            <Link to="/" className="text-sm text-muted-foreground underline">
              Back to home
            </Link>
          </p>
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
    load()
      .then((r) => setData({ id: r.id, messages: JSON.parse(r.messages) as UIMessage[] }))
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load"));
  }, [load]);
  if (loadError)
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6 text-center text-destructive">
        {loadError}
      </div>
    );
  if (!data)
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Shimmer>Loading your conversation…</Shimmer>
      </div>
    );
  return <Chat id={data.id} initial={data.messages} />;
}

const starters = [
  {
    icon: Code2,
    text: "Create something that’s uniquely yours",
    prompt: "Help me turn my website idea into a clear design and runnable code.",
    mode: "code" as const,
  },
  {
    icon: Compass,
    text: "Follow your curiosity further",
    prompt: "Help me explore a new technology and understand where to start.",
    mode: "chat" as const,
  },
  {
    icon: RouteIcon,
    text: "Give your next big idea a direction",
    prompt: "Help me plan my project from the first idea to launch.",
    mode: "plan" as const,
  },
];
type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function Chat({ id, initial }: { id: string; initial: UIMessage[] }) {
  const clear = useServerFn(clearConversation);
  const [dark, setDark] = useState(false);
  const [voice, setVoice] = useState("marin");
  const [language, setLanguage] = useState("auto");
  const [mode, setMode] = useState<WorkspaceMode>("chat");
  const [visit, setVisit] = useState(0);
  const [ready, setReady] = useState(false);
  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const [openFile, setOpenFile] = useState<FileUIPart | null>(null);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRec | null>(null);
  useEffect(() => {
    setDark(localStorage.getItem("csx-theme") === "dark");
    setVoice(localStorage.getItem("csx-voice") ?? "marin");
    setLanguage(localStorage.getItem("csx-language") ?? "auto");
    const count = Number(localStorage.getItem("csx-visits") || 0);
    setVisit(Number.isFinite(count) ? count % 10 : 0);
    localStorage.setItem("csx-visits", String(count + 1));
    setReady(true);
    return () => {
      recRef.current?.stop();
      document.documentElement.classList.remove("dark");
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("csx-theme", dark ? "dark" : "light");
    localStorage.setItem("csx-voice", voice);
    localStorage.setItem("csx-language", language);
  }, [dark, voice, language, ready]);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = useChat({
    id,
    messages: initial,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (!callMode && !document.querySelector('[role="dialog"]')) textareaRef.current?.focus();
  }, [status, callMode]);
  const send = async (value: string, files: FileUIPart[] = [], chosenMode = mode) => {
    if ((!value.trim() && !files.length) || busy) return;
    try {
      validateAttachments(files);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "Unable to attach these files.");
      throw e;
    }
    setFileError("");
    setText("");
    textareaRef.current?.focus();
    await sendMessage(
      { text: value.trim() || "Please review these attached files.", files },
      { body: { language, mode: chosenMode } },
    );
  };
  const toggleDictation = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setFileError(
        "Dictation isn’t supported in this browser. You can start a voice call instead.",
      );
      return;
    }
    const rec = new Ctor();
    rec.lang =
      language === "hinglish" ? "hi-IN" : language === "auto" ? navigator.language : language;
    rec.interimResults = true;
    rec.continuous = false;
    const base = text ? text + " " : "";
    rec.onresult = (e) =>
      setText(
        base +
          Array.from(e.results)
            .map((r) => r[0]?.transcript ?? "")
            .join(""),
      );
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
      setFileError("Microphone could not be started.");
    }
  };
  const onClear = async () => {
    if (busy || !confirm("Clear your whole conversation? This can’t be undone.")) return;
    try {
      await clear();
      setMessages([]);
      textareaRef.current?.focus();
    } catch {
      setFileError("Your conversation could not be cleared. Please try again.");
    }
  };
  const ModeIcon = mode === "code" ? Code2 : mode === "plan" ? RouteIcon : MessageCircle;
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Codesynux home" className="flex min-w-0 items-center gap-2">
          <img src={mark.url} alt="" width={28} height={28} className="shrink-0 dark:invert" />
          <span className="text-sm font-semibold">Codesynux AI</span>
        </Link>
        <WorkspaceSettings
          dark={dark}
          setDark={setDark}
          voice={voice}
          setVoice={setVoice}
          language={language}
          setLanguage={setLanguage}
          refreshKey={messages.length}
          onClear={() => void onClear()}
          canClear={!!messages.length && !busy}
        />
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <h1 className="text-sm font-medium text-muted-foreground">Codesynux Technologies</h1>
        </div>
        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4">
            {!messages.length ? (
              <ConversationEmptyState className="min-h-0 py-8 sm:py-16">
                <img src={mark.url} alt="" width={44} height={44} className="mb-3 dark:invert" />
                <h2 className="max-w-lg text-center text-2xl font-semibold">
                  {visitQuotes[visit]}
                </h2>
                <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
                  A little curiosity. A little courage. A world of possibilities.
                </p>
                <div className="mt-5 grid w-full max-w-md gap-2">
                  {starters.map(({ icon: Icon, text: label, prompt, mode: chosen }) => (
                    <Button
                      key={label}
                      variant="outline"
                      className="h-auto min-h-14 justify-start gap-3 whitespace-normal rounded-lg px-4 py-3 text-left"
                      onClick={() => {
                        setMode(chosen);
                        void send(prompt, [], chosen);
                      }}
                    >
                      <Icon className="shrink-0 text-primary" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m, i) => (
                <Message from={m.role} key={m.id}>
                  <FileStrip
                    files={m.parts.flatMap((p, j) =>
                      p.type === "file" ? [{ ...p, id: `${m.id}-${j}` }] : [],
                    )}
                    onOpen={setOpenFile}
                  />
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "rounded-2xl bg-foreground px-4 py-2.5 text-background"
                        : "bg-transparent px-0"
                    }
                  >
                    {m.parts.map((p, j) =>
                      p.type === "text" ? (
                        m.role === "assistant" ? (
                          <MessageResponse key={j} isAnimating={busy && i === messages.length - 1}>
                            {p.text}
                          </MessageResponse>
                        ) : (
                          <span key={j} className="whitespace-pre-wrap break-words">
                            {p.text}
                          </span>
                        )
                      ) : null,
                    )}
                  </MessageContent>
                  {m.role === "assistant" && !(busy && i === messages.length - 1) && (
                    <MessageActions>
                      <MessageAction
                        tooltip="Copy"
                        label="Copy"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
                          )
                        }
                      >
                        <Copy className="size-4" />
                      </MessageAction>
                      {i === messages.length - 1 && (
                        <MessageAction
                          tooltip="Regenerate"
                          label="Regenerate"
                          onClick={() => regenerate({ body: { language, mode } })}
                        >
                          <RotateCcw className="size-4" />
                        </MessageAction>
                      )}
                    </MessageActions>
                  )}
                </Message>
              ))
            )}
            {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error.message || "Your answer could not be completed."}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          {fileError && (
            <p role="alert" className="mb-2 text-sm text-destructive">
              {fileError}
            </p>
          )}
          <PromptInput
            multiple
            maxFiles={MAX_ATTACHMENTS}
            maxFileSize={MAX_ATTACHMENT_BYTES}
            onError={(e) => setFileError(e.message)}
            onSubmit={({ text: value, files }) => send(value, files)}
            className="[&>div]:rounded-2xl"
          >
            <ComposerFiles onOpen={setOpenFile} />
            <PromptInputTextarea
              ref={textareaRef}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={listening ? "Listening…" : composerQuotes[visit]}
              className="min-h-24"
            />
            <PromptInputFooter>
              <PromptInputTools>
                <AddFiles />
                <PromptInputButton
                  aria-label={listening ? "Stop dictation" : "Dictate"}
                  tooltip="Dictation"
                  variant={listening ? "secondary" : "ghost"}
                  onClick={toggleDictation}
                >
                  <Mic />
                </PromptInputButton>
                <PromptInputButton
                  aria-label="Voice call"
                  tooltip="Voice call"
                  onClick={() => setCallMode("voice")}
                >
                  <Phone />
                </PromptInputButton>
                <PromptInputButton
                  aria-label="Face to face"
                  tooltip="Face to face"
                  onClick={() => setCallMode("video")}
                >
                  <Video />
                </PromptInputButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <PromptInputButton aria-label="Conversation mode" className="gap-1 px-2">
                      <ModeIcon />
                      <span className="capitalize">{mode}</span>
                      <ChevronDown className="size-3" />
                    </PromptInputButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(["code", "chat", "plan"] as const).map((v) => (
                      <DropdownMenuItem key={v} onSelect={() => setMode(v)} className="capitalize">
                        {v === "code" ? (
                          <Code2 />
                        ) : v === "plan" ? (
                          <RouteIcon />
                        ) : (
                          <MessageCircle />
                        )}
                        {v}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </PromptInputTools>
              <SendControl status={status} stop={stop} text={text} />
            </PromptInputFooter>
          </PromptInput>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            Believe in your ideas. Create with Codesynux.
          </p>
        </div>
      </main>
      <FileViewer file={openFile} onClose={() => setOpenFile(null)} />
      {callMode && (
        <CallView
          mode={callMode}
          voice={voice}
          onVoice={setVoice}
          onClose={() => setCallMode(null)}
        />
      )}
    </div>
  );
}
