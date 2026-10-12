import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Code2, KeyRound, Menu, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import mark from "@/assets/codesynux-mark.png.asset.json";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="account-page"><header className="account-header"><div className="brand-group"><Link to="/" aria-label="Codesynux home"><img src={mark.url} width="36" height="36" alt="" /></Link><Link to="/leaderboard" className="leader-icon" aria-label="Leaderboard"><Trophy strokeWidth={1.7} /></Link></div><nav className="page-links" aria-label="Page navigation"><Link to="/console" activeProps={{ "aria-current": "page" }}>Console</Link><Link to="/pricing" activeProps={{ "aria-current": "page" }}>Pricing</Link><Link to="/ai" activeProps={{ "aria-current": "page" }}>AI Experience</Link><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="page-menu-trigger" aria-label="Navigation menu" title="Navigation menu"><Menu strokeWidth={1.7} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" sideOffset={12} className="min-w-48"><DropdownMenuItem asChild><Link to="/ide"><Code2 />Code Studio</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/api-keys"><KeyRound />API keys</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/">Home</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu></nav></header>{children}</div>;
}

export function ComingSoon({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <PageShell><main className="coming-main"><p className="section-index">{eyebrow}</p><h1>{title}</h1><p>{text}</p><span className="coming-pill">Coming soon</span><Link to="/ai" className="text-action">Explore the AI Experience →</Link></main></PageShell>;
}
