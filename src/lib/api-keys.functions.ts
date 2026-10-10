import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: allowed } = await supabase.rpc("has_console_access", { _user_id: userId });
    const { data, error } = await supabase
      .from("api_keys").select("id,name,prefix,revoked,requests,last_used_at,created_at")
      .eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your keys.");
    return { allowed: !!allowed, keys: data ?? [] };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string }) => ({ name: String(d?.name ?? "").trim().slice(0, 40) || "My key" }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: allowed } = await supabase.rpc("has_console_access", { _user_id: userId });
    if (!allowed) throw new Error("API keys are a Pro feature.");
    const { count } = await supabase.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if ((count ?? 0) >= 10) throw new Error("You can have up to 10 keys. Delete one first.");
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const secret = "csx_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("api_keys").insert({
      user_id: userId, name: data.name, prefix: secret.slice(0, 10), key_hash: await sha256(secret),
    });
    if (error) throw new Error("Could not create the key.");
    return { key: secret };
  });

export const setApiKeyRevoked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; revoked: boolean }) => ({ id: String(d.id), revoked: !!d.revoked }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("api_keys").update({ revoked: data.revoked }).eq("id", data.id);
    if (error) throw new Error("Could not update the key.");
    return { ok: true };
  });

export const deleteApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("api_keys").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Could not delete the key.");
    return { ok: true };
  });

export const ownerUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: "owner" });
    if (!isOwner) return { owner: false as const };
    const since = new Date(Date.now() - 86400000).toISOString();
    const [keys, today, chats] = await Promise.all([
      supabase.from("api_keys").select("id,name,prefix,user_id,revoked,requests,last_used_at").order("requests", { ascending: false }).limit(50),
      supabase.from("api_usage").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("api_usage").select("id", { count: "exact", head: true }).gte("status", 400).gte("created_at", since),
    ]);
    const list = keys.data ?? [];
    return {
      owner: true as const,
      totalKeys: list.length,
      activeKeys: list.filter((k) => !k.revoked).length,
      requests24h: today.count ?? 0,
      errors24h: chats.count ?? 0,
      totalRequests: list.reduce((s, k) => s + k.requests, 0),
      keys: list,
    };
  });
