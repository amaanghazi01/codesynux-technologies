import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { getAIBlock } from "./ai/access.server";
import { createLovableAiGatewayRunIdFetch } from "./ai/run-id.ts";

const PER_MINUTE = 30;
const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function publicChat(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const secret = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!secret.startsWith("csx_")) return json(401, "Missing Codesynux API key.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: key } = await supabaseAdmin.from("api_keys").select("id,user_id,revoked,requests").eq("key_hash", await sha256(secret)).maybeSingle();
  if (!key || key.revoked) return json(401, "This API key is invalid or turned off.");
  const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", key.user_id);
  if (!roles?.length) return json(403, "API access needs an active Pro plan.");

  const since = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabaseAdmin.from("api_usage").select("id", { count: "exact", head: true }).eq("key_id", key.id).gte("created_at", since);
  const log = (status: number) => supabaseAdmin.from("api_usage").insert({ key_id: key.id, user_id: key.user_id, status });
  if ((count ?? 0) >= PER_MINUTE) { await log(429); return new Response(JSON.stringify({ error: "Slow down: fair-use limit reached. Try again in a minute." }), { status: 429, headers: { "content-type": "application/json", "retry-after": "60" } }); }

  let body: { prompt?: unknown; messages?: unknown };
  try { body = await request.json(); } catch { return json(400, "Send JSON with a prompt or messages."); }
  const messages: ModelMessage[] = Array.isArray(body.messages)
    ? (body.messages as { role: string; content: unknown }[])
        .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-40).map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 20000) }))
    : typeof body.prompt === "string" ? [{ role: "user", content: body.prompt.slice(0, 20000) }] : [];
  if (!messages.length) return json(400, "Send a prompt or messages.");

  const blocked = await getAIBlock();
  if (blocked) return json(403, blocked);
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(503, "AI service is not configured.");

  await Promise.all([log(200), supabaseAdmin.from("api_keys").update({ requests: key.requests + 1, last_used_at: new Date().toISOString() }).eq("id", key.id)]);
  const runId = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }, fetch: runId.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: "You are Codesynux AI, an expert assistant for research, planning and software development. Be accurate and concise.",
    messages, maxRetries: 0, abortSignal: request.signal,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  return result.toTextStreamResponse({ headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
