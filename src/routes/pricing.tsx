import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, CreditCard, Landmark, Smartphone, Wallet, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { currentPhase, detectRegion, formatPrice, regions, scheduleOutline, type Region } from "@/lib/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Pricing — Codesynux AI Experience" },
    { name: "description", content: "Free and Pro plans for the Codesynux AI Experience, with one-time regional pricing and launch-day offers." },
    { property: "og:title", content: "Pricing — Codesynux AI Experience" },
    { property: "og:description", content: "Start free, or unlock Pro with a one-time payment. Launch-day offers up to 100% off." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Pricing,
});

const free = ["Chat with Codesynux AI", "One saved ongoing conversation", "Live voice talk", "Leaderboard, streaks and invites"];
const pro = ["Everything in Free", "Advanced coding, research and planning", "Face-to-face call with AI character", "Priority speed", "Pro badge on the leaderboard"];
const methods: Record<"india" | "global", { icon: typeof CreditCard; label: string; note: string }[]> = {
  india: [
    { icon: Smartphone, label: "UPI", note: "Google Pay, PhonePe, Paytm, BHIM" },
    { icon: CreditCard, label: "Debit / Credit card", note: "Visa, Mastercard, RuPay" },
    { icon: Landmark, label: "Net banking", note: "All major Indian banks" },
    { icon: Wallet, label: "Wallets", note: "Paytm, Amazon Pay, Mobikwik" },
  ],
  global: [
    { icon: CreditCard, label: "Debit / Credit card", note: "Visa, Mastercard, Amex" },
    { icon: Smartphone, label: "Apple Pay / Google Pay", note: "Fast checkout on your device" },
    { icon: Wallet, label: "PayPal", note: "Pay with your PayPal balance" },
    { icon: Landmark, label: "Bank transfer", note: "ACH and local bank options" },
  ],
};

function Pricing() {
  const [region, setRegion] = useState<Region>("international");
  const [phase, setPhase] = useState(currentPhase());
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  useEffect(() => { setRegion(detectRegion()); const t = setInterval(() => setPhase(currentPhase()), 30_000); return () => clearInterval(t); }, []);
  const r = regions[region];
  const discount = phase?.discount ?? 0;
  const price = Math.round(r.amount * (100 - discount)) / 100;
  const list = region === "india" ? methods.india : methods.global;
  return <PageShell><main className="pricing-main">
    <p className="section-index">Pricing</p>
    <h1>One platform. Unlimited access.</h1>
    <p className="pricing-intro">Sign up in seconds with your Codesynux account, then choose Free or Pro. Pro is a one-time payment.</p>
    <div className="region-switch" role="radiogroup" aria-label="Your region">{(Object.keys(regions) as Region[]).map(k => <Button key={k} variant="ghost" role="radio" aria-checked={region === k} className={region === k ? "active" : ""} onClick={() => setRegion(k)}>{regions[k].label}</Button>)}</div>
    {phase && phase.discount > 0 && <div className="offer-banner"><Zap size={18}/> Launch offer live: {phase.discount}% off — {phase.label}</div>}
    <div className="plan-grid">
      <article className="plan-card"><h2>Free</h2><p className="plan-price">{formatPrice(0, r.currency)}</p><p className="plan-sub">Basic features, no usage limits.</p><ul>{free.map(f => <li key={f}><Check size={16}/>{f}</li>)}</ul><Button asChild variant="outline" className="plan-btn"><Link to="/auth">Start free</Link></Button></article>
      <article className="plan-card plan-pro"><span className="plan-tag">Most powerful</span><h2>Pro</h2><p className="plan-price">{discount > 0 && <s>{formatPrice(r.amount, r.currency)}</s>} {formatPrice(price, r.currency)}</p><p className="plan-sub">One-time payment · {r.label}</p><ul>{pro.map(f => <li key={f}><Check size={16}/>{f}</li>)}</ul><Button className="plan-btn" onClick={() => { setChosen(null); setOpen(true); }}>{price === 0 ? "Claim free Pro" : "Get Pro"}</Button></article>
    </div>
    <section className="launch-box"><h2>Launch-day offers</h2><p>{phase ? "The offer timeline is running now." : "Offers start the moment Codesynux launches."}</p><ol className="launch-list">{scheduleOutline.map(([label, off, note]) => <li key={label} className={phase && phase.label.startsWith(label.split(" —")[0] ?? label) ? "now" : ""}><span>{label}</span><strong>{off ? `${off}% off` : "Full price"}</strong>{note && <em>{note}</em>}</li>)}</ol><p className="fine">Everyone who signs up early on the Free plan keeps their free subscription.</p></section>
    {open && <div className="pay-scrim" onClick={() => setOpen(false)}><div className="pay-modal" role="dialog" aria-modal="true" aria-label="Choose a payment method" onClick={e => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="panel-close" aria-label="Close" onClick={() => setOpen(false)}><X/></Button>
      <h2>Pay {formatPrice(price, r.currency)}</h2><p className="plan-sub">Codesynux Pro · one-time · {r.label}</p>
      <div className="pay-list">{list.map(m => <button key={m.label} className={`pay-option ${chosen === m.label ? "selected" : ""}`} onClick={() => setChosen(m.label)}><m.icon size={22}/><span><strong>{m.label}</strong><small>{m.note}</small></span></button>)}</div>
      {chosen && <p className="form-message" role="status">Secure checkout with {chosen} is being connected. You have not been charged.</p>}
      <Button className="plan-btn" disabled={!chosen}>Continue</Button>
    </div></div>}
  </main></PageShell>;
}
