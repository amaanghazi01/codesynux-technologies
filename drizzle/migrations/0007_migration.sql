CREATE TABLE public.ai_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT 'Untitled project',
  html text NOT NULL DEFAULT '',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  site_id uuid REFERENCES public.hosted_sites(id) ON DELETE SET NULL,
  github_repo text,
  auto_deploy boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_projects TO authenticated;
GRANT ALL ON public.ai_projects TO service_role;
ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own projects" ON public.ai_projects FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX ai_projects_user_idx ON public.ai_projects(user_id, updated_at DESC);