import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Serves websites deployed on Codesynux Server. The CSP sandbox gives each site an
// isolated origin so hosted code can never read Codesynux sign-in data.
export const Route = createFileRoute("/s/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Server not configured", { status: 503 });
        const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data } = await db.from("hosted_sites").select("html").eq("slug", params.slug.toLowerCase()).maybeSingle();
        if (!data) return new Response("<h1>Site not found</h1><p>This Codesynux site does not exist.</p>", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
        return new Response(data.html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "content-security-policy": "sandbox allow-scripts allow-forms allow-popups allow-modals",
            "cache-control": "public, max-age=30",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
