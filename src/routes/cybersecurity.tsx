import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/page-shell";

export const Route = createFileRoute("/cybersecurity")({
  head: () => ({ meta: [
    { title: "Cybersecurity Suites — Codesynux" },
    { name: "description", content: "Codesynux Cybersecurity Suites are coming soon." },
    { property: "og:title", content: "Cybersecurity Suites — Codesynux" },
    { property: "og:description", content: "Confidence for the systems that matter. Coming soon from Codesynux." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <ComingSoon eyebrow="Cybersecurity Suites" title="Confidence for the systems that matter." text="Our cybersecurity suites are being prepared." />,
});
