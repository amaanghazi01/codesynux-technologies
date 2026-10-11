import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Cpu, Database, KeyRound, Network, Rocket, Server, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ProjectPreview } from "@/components/project-preview";

export const Route = createFileRoute("/cloud-infrastructure")({
  head: () => ({ meta: [
    { title: "Codesynux Server — Cloud Infrastructure" },
    { name: "description", content: "Codesynux Server: compute, storage, networking and security with AI assistance, connected to Codesynux AI and API keys." },
    { property: "og:title", content: "Codesynux Server — Cloud Infrastructure" },
    { property: "og:description", content: "Compute, storage, networking and security, guided by Codesynux AI." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CloudPage,
});

const features = [
  { id: "compute", icon: Cpu, title: "Compute & Processing", short: "Power for apps, APIs and AI.", points: ["Plan server sizes and scaling with AI help", "Run apps and background jobs", "Estimate the compute your project needs"] },
  { id: "storage", icon: Database, title: "Storage & Databases", short: "Keep data safe and fast.", points: ["Design database tables with Codesynux AI", "File and media storage planning", "Backup and recovery checklists"] },
  { id: "network", icon: Network, title: "Networking & Traffic", short: "Reach users everywhere.", points: ["Domains, HTTPS and routing guidance", "Load balancing and caching plans", "Traffic and uptime monitoring setup"] },
  { id: "security", icon: ShieldCheck, title: "Security & Compliance", short: "Protection built in.", points: ["Access control and secret handling", "Security reviews of your code by AI", "Privacy and compliance checklists"] },
];

function CloudPage() {
  const [open, setOpen] = useState("compute");
  const active = features.find(f => f.id === open)!;
  return <PageShell><main className="cloud-main">
    <section className="cloud-hero">
      <div className="cloud-server-icon" aria-hidden="true"><Server strokeWidth={1.4} /></div>
      <p className="section-index">Cloud Infrastructure</p>
      <h1>Codesynux Server</h1>
      <p className="cloud-intro">The home for what you build with Codesynux AI — from planning and coding to deployment and care after launch.</p>
      <div className="cloud-actions"><Link to="/ai" className="cloud-btn primary"><Sparkles size={16} /> Open AI Experience</Link><Link to="/api-keys" className="cloud-btn"><KeyRound size={16} /> API keys</Link><Link to="/console" className="cloud-btn"><Rocket size={16} /> Deploy from Console</Link><ProjectPreview variant="button" /></div>
    </section>
    <section className="cloud-grid" aria-label="Server features">
      {features.map(f => <button key={f.id} type="button" className={`cloud-card ${open === f.id ? "is-open" : ""}`} aria-pressed={open === f.id} onClick={() => setOpen(f.id)}><f.icon strokeWidth={1.6} /><h2>{f.title}</h2><p>{f.short}</p></button>)}
    </section>
    <section className="cloud-detail" aria-live="polite">
      <div className="cloud-detail-head"><active.icon strokeWidth={1.6} /><h2>{active.title}</h2></div>
      <ul>{active.points.map(p => <li key={p}>{p}</li>)}</ul>
      <Link to="/ai" className="text-action">Ask Codesynux AI about {active.title.toLowerCase()} <ArrowRight size={16} /></Link>
    </section>
    <section className="cloud-plans">
      <div><h3>Free</h3><p>100 points every day for chatting, research, planning and basic coding. Points refresh daily.</p></div>
      <div><h3>Pro</h3><p>Unlimited AI use, advanced coding, testing and deployment help, Console and Codesynux API keys.</p><Link to="/pricing" className="text-action">See pricing <ArrowRight size={16} /></Link></div>
    </section>
  </main></PageShell>;
}
