import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { COMPANY_EMAIL } from "@/lib/company";

const faqs = [
  { q: "What is the Codesynux AI Experience?", a: "An all-in-one AI platform to chat, research, plan and write code — by typing, voice, or a face-to-face call with an animated AI character." },
  { q: "Do I need an account?", a: "Yes. Sign in once with a Codesynux account, Google, Apple or your mobile number, and your conversation is saved to your account." },
  { q: "Is my conversation saved?", a: "Yes. You have one ongoing conversation that continues across devices. You can clear it anytime." },
  { q: "Can the AI see my camera?", a: "No. In face-to-face mode your camera is a private preview on your screen only. The AI hears your voice." },
  { q: "Which voices are available?", a: "Ten live voices with different accents. You can switch voices on the call screen." },
  { q: "What does the free plan include?", a: "Basic features of the AI Experience. Pro adds advanced features with a one-time payment — see the Pricing page." },
  { q: "How do points and streaks work?", a: "You earn points for each day you visit and for friends who join with your invite link. The top 10 appear highlighted on the Leaderboard." },
  { q: "When are Cybersecurity and Cloud Infrastructure available?", a: "They are coming soon. Watch their pages for updates." },
];

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [
    { title: "Support & FAQ — Codesynux" },
    { name: "description", content: "Answers to common questions about Codesynux AI, plus a way to send feedback directly to the team." },
    { property: "og:title", content: "Support & FAQ — Codesynux" },
    { property: "og:description", content: "Common questions and feedback for the Codesynux AI Experience." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Support,
});

function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", topic: "General feedback", message: "" });
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!COMPANY_EMAIL) return;
    const body = `Name: ${form.name}\nTopic: ${form.topic}\n\n${form.message}`;
    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(`Codesynux feedback: ${form.topic}`)}&body=${encodeURIComponent(body)}`;
  };
  return <PageShell><main className="info-main">
    <p className="section-index">Support</p>
    <h1>We’re here to help.</h1>
    <p className="info-lead">Find quick answers, or send your feedback straight to our team.</p>
    <div className="faq-list">{faqs.map((f, i) => <div key={f.q} className="faq-item"><button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}><span>{f.q}</span><span className="faq-sign">{open === i ? "−" : "+"}</span></button>{open === i && <p>{f.a}</p>}</div>)}</div>
    <section className="info-card feedback-card"><h2>Send feedback</h2><p>Your message opens in your email app, addressed to Codesynux.</p>
      <form onSubmit={send} className="feedback-form">
        <input required placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} aria-label="Your name" />
        <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} aria-label="Topic">{["General feedback", "AI Experience", "Voice & calls", "Pricing & payments", "Leaderboard", "Bug report"].map(t => <option key={t}>{t}</option>)}</select>
        <textarea required rows={5} maxLength={2000} placeholder="Write your message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} aria-label="Message" />
        <button className="info-button" type="submit" disabled={!COMPANY_EMAIL}>{COMPANY_EMAIL ? "Send feedback" : "Feedback email coming soon"}</button>
      </form></section>
    <div className="info-cta"><Link to="/documentation" className="text-action">Read the guides →</Link><Link to="/contact" className="text-action">Contact us →</Link></div>
  </main></PageShell>;
}
