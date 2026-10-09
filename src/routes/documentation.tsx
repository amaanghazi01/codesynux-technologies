import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

const guides = [
  { id: "start", title: "Getting started", steps: ["Tap the Codesynux logo anytime to return home.", "Open the AI Experience from the homepage, the menu or “Code Build / Develop”.", "Sign in with your Codesynux account, Google, Apple or mobile number. You only need to do this once."] },
  { id: "chat", title: "Chatting with the AI", steps: ["Type in the message box at the bottom and press Enter or the send button.", "Tap the microphone to speak instead of typing (in supported browsers).", "Use Stop to end an answer early, Copy to copy a reply, and Regenerate for a fresh answer.", "Your conversation is saved to your account and continues where you left off."] },
  { id: "build", title: "Building and coding", steps: ["Describe what you want to build: website, app, AI tool, security or cloud setup.", "Ask for a plan first, then for complete code step by step.", "Mention your language, framework and any limits for the best results.", "Ask the AI to research current facts — it shows the sources it used."] },
  { id: "voice", title: "Live voice and face to face", steps: ["Tap the voice button to start a live spoken conversation.", "Tap the face-to-face button to see your camera preview next to the animated AI character.", "Pick from ten voices, mute yourself, and read live captions.", "Your camera stays private on your screen — the AI only hears you."] },
  { id: "account", title: "Account, pricing and leaderboard", steps: ["See plans and payment options on the Pricing page.", "Visit the Leaderboard via the trophy icon to see ranks, points and streaks.", "Share your invite link — you earn points when friends join.", "Open the bag icon to reach Orders, Your Saves and Account settings."] },
];

export const Route = createFileRoute("/documentation")({
  head: () => ({ meta: [
    { title: "Documentation — Codesynux" },
    { name: "description", content: "Learn how to use the Codesynux AI Experience: chat, coding, live voice, face-to-face calls, pricing and leaderboard." },
    { property: "og:title", content: "Documentation — Codesynux" },
    { property: "og:description", content: "Step-by-step guides for the Codesynux AI Experience platform." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Docs,
});

function Docs() {
  return <PageShell><main className="info-main">
    <p className="section-index">Documentation</p>
    <h1>How to use Codesynux AI.</h1>
    <p className="info-lead">Everything you need to chat, build and talk live with your AI.</p>
    <nav className="info-toc" aria-label="Guides">{guides.map(g => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>
    <div className="info-grid">{guides.map((g, i) => <section id={g.id} key={g.id} className="info-card"><span className="info-num">{String(i + 1).padStart(2, "0")}</span><h2>{g.title}</h2><ol>{g.steps.map(s => <li key={s}>{s}</li>)}</ol></section>)}</div>
    <div className="info-cta"><Link to="/ai" className="info-button">Open AI Experience</Link><Link to="/support" className="text-action">Need help? Visit Support →</Link></div>
  </main></PageShell>;
}
