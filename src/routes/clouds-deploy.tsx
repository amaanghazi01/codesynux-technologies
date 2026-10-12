import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Cloud, Globe, AppWindow, Code2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { DeployPanel } from "@/components/deploy-panel";

export const Route = createFileRoute("/clouds-deploy")({
  head: () => ({ meta: [
    { title: "Deploy — Codesynux Clouds" },
    { name: "description", content: "Publish a single-page website with Codesynux Clouds. Software and app deployment details are coming later." },
    { property: "og:title", content: "Deploy — Codesynux Clouds" },
    { property: "og:description", content: "Your Codesynux Clouds deployment workspace for single-page websites." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CloudsDeployPage,
});

function CloudsDeployPage() {
  return <PageShell><main className="clouds-deployment">
    <Link to="/cloud-infrastructure" className="back-link"><ArrowLeft size={15} /> Codesynux Clouds</Link>
    <header className="clouds-deployment-heading">
      <Cloud size={38} strokeWidth={1.5} aria-hidden="true" />
      <p className="section-index">Codesynux Clouds</p>
      <h1>Deploy your project.</h1>
      <p>Start with a website. Software and app deployment details are coming later.</p>
    </header>
    <div className="clouds-project-types" aria-label="Deployment availability">
      <div><Globe size={22} /><h2>Website</h2><p>Single-page HTML, CSS and JavaScript.</p><span>Available now</span></div>
      <div><Code2 size={22} /><h2>Software</h2><p>Deployment details coming later.</p><span className="clouds-pending">Coming soon</span></div>
      <div><AppWindow size={22} /><h2>Apps</h2><p>Deployment details coming later.</p><span className="clouds-pending">Coming soon</span></div>
    </div>
    <DeployPanel />
  </main></PageShell>;
}