import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cloud } from "lucide-react";
import { CloudsManager } from "@/components/clouds-manager";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cloud-infrastructure")({
  head: () => ({ meta: [
    { title: "Codesynux Clouds — Cloud Infrastructure" },
    { name: "description", content: "Codesynux Clouds: a simple place to start website deployment, with software and app details coming later." },
    { property: "og:title", content: "Codesynux Clouds — Cloud Infrastructure" },
    { property: "og:description", content: "Start with a single-page website. Publish, share and manage it with Codesynux Clouds." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CloudsPage,
});

function CloudsPage() {
  return <PageShell><main className="clouds-overview">
    <section className="clouds-entry" aria-labelledby="clouds-title">
      <Button asChild variant="ghost" className="clouds-icon-link"><Link to="/clouds-deploy" aria-label="Start Codesynux Clouds"><Cloud strokeWidth={1.25} /></Link></Button>
      <p className="section-index">Cloud Infrastructure</p>
      <h1 id="clouds-title">Codesynux Clouds</h1>
      <p className="clouds-lead">A home for your next project.</p>
      <p className="clouds-entry-copy">Ready for deployment with Codesynux Clouds.</p>
      <Button asChild size="lg" className="clouds-start"><Link to="/clouds-deploy">Deploy new project <ArrowRight size={17} /></Link></Button>
    </section>
    <section className="clouds-capabilities"><div className="clouds-capabilities-inner">
      <CloudsManager />
      <p className="clouds-banner-copy mt-6">Every site is served over HTTPS with automatic certificates, delivered from servers near each visitor, with no downtime when you redeploy.</p>
    </div></section>
  </main></PageShell>;
}
