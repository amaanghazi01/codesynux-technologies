import { createFileRoute, Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { COMPANY_EMAIL, SOCIAL_LINKS } from "@/lib/company";

const icons = [Instagram, Facebook, Twitter, Linkedin, Youtube];

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Codesynux" },
    { name: "description", content: "Connect with Codesynux on Instagram, Facebook, X, LinkedIn, YouTube and email." },
    { property: "og:title", content: "Contact — Codesynux" },
    { property: "og:description", content: "Follow and connect with Codesynux across social media." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Contact,
});

function Contact() {
  return <PageShell><main className="info-main">
    <p className="section-index">Contact</p>
    <h1>Let’s build what’s next.</h1>
    <p className="info-lead">Follow Codesynux and stay connected wherever you are.</p>
    <div className="social-grid">
      {SOCIAL_LINKS.map((s, i) => { const Icon = icons[i]; const inner = <><Icon strokeWidth={1.6} /><strong>{s.name}</strong><span>{s.url ? s.handle : "Coming soon"}</span></>;
        return s.url ? <a key={s.name} className="social-card" href={s.url} target="_blank" rel="noopener noreferrer">{inner}</a> : <div key={s.name} className="social-card is-soon">{inner}</div>; })}
      {COMPANY_EMAIL ? <a className="social-card" href={`mailto:${COMPANY_EMAIL}`}><Mail strokeWidth={1.6} /><strong>Email</strong><span>{COMPANY_EMAIL}</span></a> : <div className="social-card is-soon"><Mail strokeWidth={1.6} /><strong>Email</strong><span>Coming soon</span></div>}
    </div>
    <div className="info-cta"><Link to="/support" className="text-action">Send feedback →</Link></div>
  </main></PageShell>;
}
