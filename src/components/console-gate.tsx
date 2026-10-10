import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { useConsoleAccess, type ConsoleAccess } from "@/lib/console";

export function ConsoleGate({ children }: { children: (access: ConsoleAccess) => ReactNode }) {
  const access = useConsoleAccess();
  if (access.loading) return <PageShell><main className="coming-main"><p className="text-muted-foreground">Loading Console…</p></main></PageShell>;
  if (!access.signedIn) return <PageShell><main className="coming-main"><Lock className="size-10" strokeWidth={1.4} /><p className="section-index">Console / Dashboard</p><h1>Sign in to open Console.</h1><p>Your projects, team and launches live here.</p><Button asChild size="lg" className="rounded-full"><Link to="/auth">Sign in</Link></Button></main></PageShell>;
  if (!access.allowed) return <PageShell><main className="coming-main"><Lock className="size-10" strokeWidth={1.4} /><p className="section-index">Pro feature</p><h1>Console is locked.</h1><p>Upgrade to Pro to unlock team collaboration, live project previews and every phase from research to launch and maintenance.</p><Button asChild size="lg" className="rounded-full"><Link to="/pricing">Upgrade to Pro</Link></Button><Link to="/ai" className="text-action">Keep using the free AI Experience →</Link></main></PageShell>;
  return <>{children(access)}</>;
}
