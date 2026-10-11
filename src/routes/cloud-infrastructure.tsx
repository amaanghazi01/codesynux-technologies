import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Cloud, Cpu, Database, Gauge, KeyRound, Link2, Mic, Network, Rocket, Server, ShieldCheck, Sparkles, Zap } from "lucide-react";
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
    <section className="sl-banner" aria-label="AI Serverless Cloud">
      <div className="sl-icon" aria-hidden="true"><Cloud strokeWidth={1.5} /></div>
      <div><p className="section-index">AI Serverless Cloud</p><h2>No servers to manage. It scales by itself.</h2><p>Codesynux AI runs on serverless cloud: code starts only when someone sends a message, grows automatically with traffic, and restarts cleanly if something fails.</p>
        <ul className="sl-list"><li><Zap size={15} /> Starts on demand, worldwide</li><li><Gauge size={15} /> Scales automatically with users</li><li><ShieldCheck size={15} /> Sign-in and API-key protected</li></ul></div>
    </section>
    <div className="sl-link" aria-hidden="true"><span /><Link2 size={16} /><span /></div>
    <section className="sl-banner sl-gpu" aria-label="AI Serverless GPU API">
      <div className="sl-icon" aria-hidden="true"><Cpu strokeWidth={1.5} /></div>
      <div><p className="section-index">AI Serverless GPU API</p><h2>GPU power, called like an API.</h2><p>Each answer is computed on data-centre GPUs from leading AI providers, reached through one secure gateway. You never rent or maintain a GPU — you pay only for what is used.</p>
        <ul className="sl-list"><li><Sparkles size={15} /> Chat, research and coding</li><li><Mic size={15} /> Live voice, English and Hindi</li><li><KeyRound size={15} /> Your Codesynux API keys</li></ul></div>
    </section>
    <section className="sl-status" aria-label="Connection status">
      {[["Serverless Cloud", "Connected"], ["GPU API", "Connected"], ["AI Experience", "Running on both"], ["API keys", "Running on both"]].map(([a, b]) => <div key={a}><span className="sl-dot" />{a}<small>{b}</small></div>)}
    </section>
    <section className="cloud-plans">
      <div><h3>Free users</h3><p>100 points a day on the same serverless cloud and GPU API.</p></div>
      <div><h3>Pro &amp; founder</h3><p>Unlimited use, advanced coding and API keys. Founder access is on your owner account.</p></div>
    </section>
    <p className="sl-note">GPUs are real hardware in providers' data centres; answers use your workspace AI credits.</p>
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
