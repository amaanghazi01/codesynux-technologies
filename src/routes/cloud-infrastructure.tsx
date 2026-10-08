import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/page-shell";

export const Route = createFileRoute("/cloud-infrastructure")({
  head: () => ({ meta: [
    { title: "Cloud Infrastructure — Codesynux" },
    { name: "description", content: "Codesynux Cloud Infrastructure is coming soon." },
    { property: "og:title", content: "Cloud Infrastructure — Codesynux" },
    { property: "og:description", content: "Built for wherever you're going next. Coming soon from Codesynux." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <ComingSoon eyebrow="Cloud Infrastructure" title="Built for wherever you’re going next." text="Our cloud infrastructure services are being prepared." />,
});
