import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bookmark, Box, CircleUserRound, Menu, Search, Settings, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import mark from "@/assets/codesynux-mark.png.asset.json";
import hero from "@/assets/technology-hero.jpg";

const quickLinks = [
  { label: "Artificial Intelligence Experience", id: "artificial-intelligence" },
  { label: "Cybersecurity Suites", id: "cybersecurity" },
  { label: "Cloud Infrastructure", id: "cloud-infrastructure" },
];
const navigation = [
  { label: "Console / Dashboard", id: "console" },
  { label: "Code Build / Develop", id: "develop" },
  { label: "Cloud Infrastructure", id: "cloud-infrastructure" },
  { label: "Cybersecurity", id: "cybersecurity" },
  { label: "Pricing", id: "pricing" },
  { label: "Documentation", id: "documentation" },
  { label: "Support", id: "support" },
  { label: "Contact", id: "contact" },
];
const services = [
  { id: "artificial-intelligence", number: "01", label: "Artificial Intelligence Experience", description: "A new way to think about what’s possible.", tone: "service-ai" },
  { id: "cybersecurity", number: "02", label: "Cybersecurity Suites", description: "Confidence for the systems that matter.", tone: "service-security" },
  { id: "cloud-infrastructure", number: "03", label: "Cloud Infrastructure", description: "Built for wherever you’re going next.", tone: "service-cloud" },
];

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Codesynux — Technology, thoughtfully built" },
    { name: "description", content: "Explore Codesynux: artificial intelligence, cybersecurity, cloud infrastructure, and software development." },
    { property: "og:title", content: "Codesynux — Technology, thoughtfully built" },
    { property: "og:description", content: "Explore artificial intelligence, cybersecurity, cloud infrastructure, and software development at Codesynux." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const [panel, setPanel] = useState<"search" | "bag" | "menu" | null>(null);
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => subscription.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (panel === "search") searchRef.current?.focus();
    document.body.style.overflow = panel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panel]);
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);
  const filteredLinks = quickLinks.filter(item => item.label.toLowerCase().includes(query.toLowerCase().trim()));
  const closeAndScroll = (id: string) => {
    setPanel(null);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 30);
  };
  return <div className="site-shell">
    <header className="global-header">
      <nav className="global-nav" aria-label="Main navigation">
        <Link to="/" className="brand-link" aria-label="Codesynux home" onClick={() => setPanel(null)}><img src={mark.url} width="36" height="36" alt="" /></Link>
        <div className="desktop-nav">{navigation.map(item => item.id === "develop" ? <Link key={item.id} to="/ai">{item.label}</Link> : <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</div>
        <div className="nav-actions">
          <Button variant="ghost" size="icon" className="nav-icon" aria-label="Search" aria-expanded={panel === "search"} onClick={() => setPanel(panel === "search" ? null : "search")}><Search strokeWidth={1.7}/></Button>
          <Button variant="ghost" size="icon" className="nav-icon" aria-label="Bag" aria-expanded={panel === "bag"} onClick={() => setPanel(panel === "bag" ? null : "bag")}><ShoppingBag strokeWidth={1.7}/></Button>
          <Button variant="ghost" size="icon" className="nav-icon mobile-menu-button" aria-label="Menu" aria-expanded={panel === "menu"} onClick={() => setPanel(panel === "menu" ? null : "menu")}><Menu strokeWidth={1.7}/></Button>
        </div>
      </nav>
    </header>
    {panel && <><div className="panel-scrim" onClick={() => setPanel(null)} aria-hidden="true" /><div className={`nav-panel ${panel === "menu" ? "menu-panel" : ""}`} role="dialog" aria-modal="true" aria-label={panel === "search" ? "Search" : panel === "bag" ? "Bag" : "Menu"}>
      <div className="panel-inner"><Button variant="ghost" size="icon" className="panel-close" aria-label="Close" onClick={() => setPanel(null)}><X strokeWidth={1.5}/></Button>
        {panel === "search" && <div className="search-panel-content"><div className="search-field"><Search strokeWidth={1.5} /><input ref={searchRef} aria-label="Search Codesynux" placeholder="Search Codesynux" value={query} onChange={e => setQuery(e.target.value)} /></div><p className="panel-label">{query ? "Results" : "Quick Links"}</p><div className="panel-list">{filteredLinks.length ? filteredLinks.map(item => <Button variant="ghost" key={item.id} className="panel-list-item" onClick={() => closeAndScroll(item.id)}><ArrowRight />{item.label}</Button>) : <p className="panel-empty">No matches found.</p>}</div></div>}
        {panel === "bag" && <div className="bag-panel-content"><h2>Your Bag is empty.</h2><p className="bag-subline">{signedIn ? "Your saved items and orders are ready when you are." : <><Link to="/auth">Sign in</Link> to see if you have any saved items.</>}</p><p className="panel-label">My Profile</p><div className="panel-list profile-list"><Link to="/account" search={{ view: "orders" }}><Box />Orders</Link><Link to="/account" search={{ view: "saves" }}><Bookmark />Your Saves</Link><Link to="/account" search={{ view: "account" }}><Settings />Account</Link>{!signedIn && <Link to="/auth"><CircleUserRound />Sign in</Link>}</div></div>}
        {panel === "menu" && <div className="menu-panel-content">{navigation.map(item => item.id === "develop" ? <Button asChild variant="ghost" key={item.id}><Link to="/ai" onClick={() => setPanel(null)}>{item.label}</Link></Button> : <Button variant="ghost" key={item.id} onClick={() => closeAndScroll(item.id)}>{item.label}</Button>)}</div>}
      </div>
    </div></>}
    <main>
      <section className="hero" aria-labelledby="hero-title"><img className="hero-image" src={hero} width="1600" height="1100" alt="Translucent glass architecture illuminated with blue and green light" /><div className="hero-copy"><p className="hero-brand">Codesynux</p><h1 id="hero-title">Technology, thoughtfully built.</h1><p className="hero-subtitle">A world of possibilities starts here.</p><a className="text-action" href="#explore">Explore what we do <ArrowRight size={18}/></a></div></section>
      <section id="explore" className="intro-band"><p>Ideas become the next big thing when the right technology brings them to life.</p></section>
      <section className="services" aria-label="What we do">{services.map(service => <article id={service.id} className={`service-band ${service.tone}`} key={service.id}><div className="service-content"><span className="service-number">{service.number} / Explore</span><h2>{service.label}</h2><p>{service.description}</p>{service.id === "artificial-intelligence" ? <Link to="/ai" className="text-action">Open AI Experience <ArrowRight size={18}/></Link> : <a href="#contact" className="text-action">Get in touch <ArrowRight size={18}/></a>}</div><div className="service-visual" aria-hidden="true"><div className="visual-core"><span /><span /><span /></div></div></article>)}</section>
      <section id="develop" className="simple-section"><span className="section-index">Build / Develop</span><h2>Make something remarkable.</h2><p>Plan, research and write code with Codesynux AI — by chat, voice or face to face.</p><Link to="/ai" className="text-action">Start building with AI <ArrowRight size={18}/></Link></section>
      <section id="console" className="simple-section alt-section"><span className="section-index">Console / Dashboard</span><h2>Everything in one place.</h2><p>Your workspace is on its way.</p><Link to="/auth" className="text-action">Sign in <ArrowRight size={18}/></Link></section>
      <section id="pricing" className="simple-section"><span className="section-index">Pricing</span><h2>Built around your needs.</h2><p>Tell us what you’re looking to make.</p><a href="#contact" className="text-action">Get in touch <ArrowRight size={18}/></a></section>
      <section id="documentation" className="simple-section alt-section"><span className="section-index">Documentation</span><h2>Details, coming together.</h2><p>Our documentation will be available here soon.</p></section>
      <section id="support" className="simple-section"><span className="section-index">Support</span><h2>We’re here to help.</h2><p>Support information will be available here soon.</p></section>
      <section id="contact" className="simple-section contact-section"><span className="section-index">Contact</span><h2>Let’s build what’s next.</h2><p>Contact details will be available here soon.</p></section>
    </main><footer className="site-footer"><span>© {new Date().getFullYear()} Codesynux</span><a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top ↑</a></footer>
  </div>;
}
