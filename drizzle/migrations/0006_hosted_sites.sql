CREATE TABLE public.hosted_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  title text NOT NULL DEFAULT 'My website' CHECK (char_length(title) <= 80),
  html text NOT NULL CHECK (char_length(html) <= 500000),
  deploys integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hosted_sites TO authenticated;
GRANT SELECT ON public.hosted_sites TO anon;
GRANT ALL ON public.hosted_sites TO service_role;
ALTER TABLE public.hosted_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published sites are public" ON public.hosted_sites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners add sites" ON public.hosted_sites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND (SELECT count(*) FROM public.hosted_sites h WHERE h.user_id = auth.uid()) < 10);
CREATE POLICY "Owners update sites" ON public.hosted_sites FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete sites" ON public.hosted_sites FOR DELETE TO authenticated USING (user_id = auth.uid());