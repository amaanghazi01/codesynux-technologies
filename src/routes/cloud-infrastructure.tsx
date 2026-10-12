import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cloud, Globe, RefreshCw, Upload } from "lucide-react";
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
      <p className="clouds-entry-copy">Start with website deployment.<br />Software and apps are next — details coming later.</p>
      <Button asChild size="lg" className="clouds-start"><Link to="/clouds-deploy">Start Codesynux Clouds <ArrowRight size={17} /></Link></Button>
    </section>
    <section className="clouds-capabilities" aria-labelledby="clouds-capabilities-title">
      <div className="clouds-capabilities-inner">
        <p className="section-index">Available today</p>
        <h2 id="clouds-capabilities-title">From your code to a live website.</h2>
        <p className="clouds-banner-copy">Single-page websites. One address. A place to manage what you publish.</p>
        <div className="clouds-benefits">
          <div><Upload strokeWidth={1.5} /><h3>Bring your code</h3><p>Paste HTML, CSS and JavaScript, or import your work from Code Studio.</p></div>
          <div><Globe strokeWidth={1.5} /><h3>Publish and share</h3><p>Give your website an address and share its link.</p></div>
          <div><RefreshCw strokeWidth={1.5} /><h3>Keep it up to date</h3><p>View your live websites, redeploy changes or take a website offline.</p></div>
        </div>
      </div>
    </section>
  </main></PageShell>;
}
