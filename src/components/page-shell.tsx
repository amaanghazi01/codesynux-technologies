import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Trophy } from "lucide-react";
import mark from "@/assets/codesynux-mark.png.asset.json";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="account-page"><header className="account-header"><div className="brand-group"><Link to="/" aria-label="Codesynux home"><img src={mark.url} width="36" height="36" alt="" /></Link><Link to="/leaderboard" className="leader-icon" aria-label="Leaderboard"><Trophy strokeWidth={1.7} /></Link></div><nav className="page-links"><Link to="/console">Console</Link><Link to="/api-keys">API keys</Link><Link to="/pricing">Pricing</Link><Link to="/ai">AI Experience</Link><Link to="/">Home</Link></nav></header>{children}</div>;
}

export function ComingSoon({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <PageShell><main className="coming-main"><p className="section-index">{eyebrow}</p><h1>{title}</h1><p>{text}</p><span className="coming-pill">Coming soon</span><Link to="/ai" className="text-action">Explore the AI Experience →</Link></main></PageShell>;
}
