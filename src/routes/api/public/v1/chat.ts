import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/v1/chat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "POST, OPTIONS" } }),
      POST: async ({ request }) => {
        try {
          const { publicChat } = await import("@/lib/api-public.server");
          return await publicChat(request);
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          console.error("Public API failed", e instanceof Error ? e.message : e);
          return new Response(JSON.stringify({ error: "Request failed. Try again later." }), { status: 500, headers: { "content-type": "application/json" } });
        }
      },
    },
  },
});
