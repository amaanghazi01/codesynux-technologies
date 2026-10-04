import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getCountries, getCountryCallingCode, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import mark from "@/assets/codesynux-mark.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in or create an account — Codesynux" },
    { name: "description", content: "Sign in to your Codesynux account with email, Google, Apple, or your mobile number." },
    { property: "og:title", content: "Sign in or create an account — Codesynux" },
    { property: "og:description", content: "Access your Codesynux account with your preferred sign-in method." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: Auth,
});

const countries = getCountries();
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<CountryCode>("IN");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fullPhone = `+${getCountryCallingCode(country)}${phone.replace(/\D/g, "")}`;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      if (method === "email") {
        if (mode === "signup") {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data.session) navigate({ to: "/account", search: { view: "account" } });
          else setMessage("Check your email for a confirmation link to finish creating your account.");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          navigate({ to: "/account", search: { view: "account" } });
        }
      } else if (otpSent) {
        const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
        if (error) throw error;
        navigate({ to: "/account", search: { view: "account" } });
      } else {
        if (!isValidPhoneNumber(fullPhone)) throw new Error("Enter a valid mobile number for the selected country.");
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (error) throw error;
        setOtpSent(true); setMessage("A verification code has been sent to your mobile number.");
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  async function social(provider: "google" | "apple") {
    setError(""); setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/account", search: { view: "account" } });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not connect. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="account-page"><header className="account-header"><Link to="/" aria-label="Codesynux home"><img src={mark.url} alt="" width="36" height="36" /></Link></header><main className="auth-main"><Link to="/" className="back-link"><ArrowLeft size={16}/> Home</Link><div className="auth-wrap"><p className="section-index">Codesynux Account</p><h1>{mode === "signin" ? "Sign in." : "Create your account."}</h1><p className="auth-intro">One account for your Codesynux experience.</p><div className="auth-tabs"><Button variant="ghost" className={method === "email" ? "active" : ""} onClick={() => { setMethod("email"); setMessage(""); setError(""); }}><Mail size={16}/> Email</Button><Button variant="ghost" className={method === "phone" ? "active" : ""} onClick={() => { setMethod("phone"); setMessage(""); setError(""); }}><Smartphone size={16}/> Mobile</Button></div><form onSubmit={submit} className="auth-form">{method === "email" ? <><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /></label></> : <><label>Country<select value={country} onChange={e => { setCountry(e.target.value as CountryCode); setOtpSent(false); }}>{countries.map(code => <option key={code} value={code}>{countryNames.of(code) ?? code} (+{getCountryCallingCode(code)})</option>)}</select></label><label>Mobile number<input type="tel" autoComplete="tel-national" required value={phone} onChange={e => { setPhone(e.target.value); setOtpSent(false); }} placeholder="Mobile number" /></label>{otpSent && <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter the code" /></label>}</>}{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}<Button type="submit" disabled={busy} className="auth-submit">{busy ? "Please wait…" : method === "phone" ? otpSent ? "Verify & sign in" : "Send verification code" : mode === "signup" ? "Create account" : "Sign in"}</Button></form>{method === "email" && <p className="auth-switch">{mode === "signin" ? "New to Codesynux?" : "Already have an account?"} <Button variant="link" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); setError(""); }}>{mode === "signin" ? "Create an account" : "Sign in"}</Button></p>}<div className="auth-divider"><span>or continue with</span></div><div className="social-actions"><Button variant="outline" disabled={busy} onClick={() => social("google")}><span className="google-g" aria-hidden="true">G</span> Google</Button><Button variant="outline" disabled={busy} onClick={() => social("apple")}><span className="apple-symbol" aria-hidden="true">●</span> Apple</Button></div></div></main></div>;
}
