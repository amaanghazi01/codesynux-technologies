import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, Trash2, Power, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { listApiKeys, createApiKey, setApiKeyRevoked, deleteApiKey, ownerUsage } from "@/lib/api-keys.functions";

export const Route = createFileRoute("/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys — Codesynux AI" },
      { name: "description", content: "Create and manage Codesynux API keys to use Codesynux AI inside your own apps." },
      { property: "og:title", content: "Codesynux API keys" },
      { property: "og:description", content: "Connect your apps to Codesynux AI with your own secure keys." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApiKeysPage,
});

type Key = { id: string; name: string; prefix: string; revoked: boolean; requests: number; last_used_at: string | null; created_at: string };
type Usage = Awaited<ReturnType<typeof ownerUsage>>;
const when = (d: string | null) => (d ? new Date(d).toLocaleString() : "Never");

function ApiKeysPage() {
  const [signed, setSigned] = useState<boolean | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSigned(!!data.session)); }, []);
  if (signed === null) return <PageShell><main className="coming-main"><p className="text-muted-foreground">Loading…</p></main></PageShell>;
  if (!signed) return <PageShell><main className="coming-main"><KeyRound className="size-10" strokeWidth={1.4} /><p className="section-index">API keys</p><h1>Sign in to manage keys.</h1><Button asChild size="lg" className="rounded-full"><Link to="/auth">Sign in</Link></Button></main></PageShell>;
  return <Keys />;
}

function Keys() {
  const list = useServerFn(listApiKeys), create = useServerFn(createApiKey), toggle = useServerFn(setApiKeyRevoked), del = useServerFn(deleteApiKey), usage = useServerFn(ownerUsage);
  const [state, setState] = useState<{ allowed: boolean; keys: Key[] } | null>(null);
  const [stats, setStats] = useState<Usage | null>(null);
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setState(await list()); setStats(await usage()); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not load"); }
  }, [list, usage]);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!state) return <PageShell><main className="coming-main"><p className="text-muted-foreground">Loading your keys…</p></main></PageShell>;
  if (!state.allowed) return <PageShell><main className="coming-main"><KeyRound className="size-10" strokeWidth={1.4} /><p className="section-index">Pro feature</p><h1>API keys are for Pro.</h1><p>Upgrade to connect your own apps to Codesynux AI.</p><Button asChild size="lg" className="rounded-full"><Link to="/pricing">Upgrade to Pro</Link></Button></main></PageShell>;

  const onCreate = async () => {
    try { const r = await create({ data: { name } }); setFresh(r.key); setName(""); await refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-4xl space-y-10 px-5 py-12">
        <div className="space-y-2">
          <p className="section-index">Developers</p>
          <h1 className="text-4xl font-semibold tracking-tight">API keys</h1>
          <p className="text-muted-foreground">Use Codesynux AI inside your own websites and apps. Keep your keys private.</p>
        </div>

        <section className="space-y-3 rounded-3xl border border-border p-5">
          <h2 className="font-semibold">Create a key</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name, e.g. My app" maxLength={40} className="flex-1 rounded-full border border-border bg-background px-4 py-2" />
            <Button className="rounded-full" onClick={onCreate}><KeyRound /> Create key</Button>
          </div>
          {fresh && (
            <div className="space-y-2 rounded-2xl bg-muted p-4 text-sm">
              <p className="font-medium">Copy your key now. For safety, it won’t be shown again.</p>
              <div className="flex items-center gap-2"><code className="flex-1 break-all">{fresh}</code>
                <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(fresh); toast.success("Key copied"); }}><Copy /> Copy</Button></div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Your keys</h2>
          {state.keys.length === 0 ? <p className="text-sm text-muted-foreground">No keys yet.</p> : (
            <ul className="divide-y divide-border rounded-3xl border border-border">
              {state.keys.map((k) => (
                <li key={k.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="font-medium">{k.name} {k.revoked && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">Off</span>}</p>
                    <p className="text-xs text-muted-foreground"><code>{k.prefix}…</code> · {k.requests} requests · last used {when(k.last_used_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={async () => { await toggle({ data: { id: k.id, revoked: !k.revoked } }); await refresh(); }}><Power /> {k.revoked ? "Turn on" : "Turn off"}</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={async () => { if (!confirm("Delete this key? Apps using it will stop working.")) return; await del({ data: { id: k.id } }); await refresh(); }}><Trash2 /> Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2 rounded-3xl border border-border p-5 text-sm">
          <h2 className="font-semibold">How to use</h2>
          <p className="text-muted-foreground">Send a request with your key. The answer streams back as text. Each key can make up to 30 requests per minute.</p>
          <pre className="overflow-x-auto rounded-2xl bg-muted p-4 text-xs">{`curl ${origin}/api/public/v1/chat \\
  -H "Authorization: Bearer csx_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Explain REST APIs in one paragraph"}'`}</pre>
          <p className="text-muted-foreground">For a conversation, send <code>{`{"messages":[{"role":"user","content":"..."}]}`}</code>.</p>
        </section>

        {stats?.owner && (
          <section className="space-y-4 rounded-3xl border border-border p-5">
            <h2 className="flex items-center gap-2 font-semibold"><BarChart3 className="size-5" /> Owner dashboard</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["All keys", stats.totalKeys], ["Active keys", stats.activeKeys], ["Requests (24h)", stats.requests24h], ["Blocked (24h)", stats.errors24h]].map(([l, v]) => (
                <div key={String(l)} className="rounded-2xl bg-muted p-4"><p className="text-2xl font-semibold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Total requests ever: {stats.totalRequests}</p>
            <ul className="divide-y divide-border text-sm">
              {stats.keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 py-2">
                  <span>{k.name} <code className="text-xs text-muted-foreground">{k.prefix}…</code></span>
                  <span className="flex items-center gap-2 text-muted-foreground">{k.requests} req
                    <Button size="sm" variant="ghost" onClick={async () => { await toggle({ data: { id: k.id, revoked: !k.revoked } }); await refresh(); }}>{k.revoked ? "Turn on" : "Turn off"}</Button></span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </PageShell>
  );
}
