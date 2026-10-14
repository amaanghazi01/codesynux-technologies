import { supabase } from "@/integrations/supabase/client";

export type AIProject = { id: string; name: string; html: string; messages: unknown; site_id: string | null; github_repo: string | null; auto_deploy: boolean; updated_at: string };

export function extractHtml(text: string): string | null {
  const blocks = [...text.matchAll(/```html\s*\n([\s\S]*?)(```|$)/gi)];
  const last = blocks.at(-1)?.[1]?.trim();
  return last && /<(html|body|div|main|section|!doctype)/i.test(last) ? last : null;
}

export function slugify(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "site";
  return base.length < 3 ? `${base}-site` : base;
}

export async function createProject() {
  const { data, error } = await supabase.from("ai_projects").insert({}).select("id").single();
  if (error) throw new Error("Your project could not be created. Please try again.");
  return data.id;
}

/** Publishes the project to Codesynux Clouds; returns the live slug. */
export async function deployProject(p: { id: string; name: string; html: string; site_id: string | null }): Promise<string> {
  if (!p.html.trim()) throw new Error("Build something first — the website is still empty.");
  if (p.site_id) {
    const { data: site } = await supabase.from("hosted_sites").select("slug,deploys").eq("id", p.site_id).maybeSingle();
    if (site) {
      const { error } = await supabase.from("hosted_sites").update({ html: p.html, title: p.name, deploys: site.deploys + 1, updated_at: new Date().toISOString() }).eq("id", p.site_id);
      if (error) throw new Error("Redeploy failed. Please try again.");
      return site.slug;
    }
  }
  const base = slugify(p.name);
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase.from("hosted_sites").insert({ slug, title: p.name, html: p.html }).select("id").single();
    if (!error) {
      await supabase.from("ai_projects").update({ site_id: data.id }).eq("id", p.id);
      return slug;
    }
    if (error.code === "42501") throw new Error("Limit reached: 10 live websites per account. Take one down in Codesynux Clouds.");
    if (error.code !== "23505") throw new Error("Deploy failed. Please try again.");
  }
  throw new Error("Could not find a free web address. Rename the project and try again.");
}
