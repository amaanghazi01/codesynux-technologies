CREATE TYPE public.app_role AS ENUM ('owner', 'pro');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.has_console_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','pro'))
$$;

CREATE TABLE public.console_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'website',
  phase text NOT NULL DEFAULT 'research',
  description text NOT NULL DEFAULT '',
  preview_url text,
  share_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.console_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.console_projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, email)
);
CREATE TABLE public.console_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.console_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'task',
  done boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.console_projects, public.console_members, public.console_tasks TO authenticated;
GRANT ALL ON public.console_projects, public.console_members, public.console_tasks TO service_role;
ALTER TABLE public.console_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_tasks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_console_access(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.console_projects p WHERE p.id = _project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.console_members m WHERE m.project_id = p.id AND lower(m.email) = lower(auth.jwt() ->> 'email')
      )
    )
  )
$$;
CREATE OR REPLACE FUNCTION public.owns_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.console_projects WHERE id = _project_id AND owner_id = auth.uid())
$$;

CREATE POLICY "Access projects" ON public.console_projects FOR SELECT TO authenticated USING (public.can_access_project(id));
CREATE POLICY "Create projects" ON public.console_projects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_console_access(auth.uid()));
CREATE POLICY "Team updates projects" ON public.console_projects FOR UPDATE TO authenticated USING (public.can_access_project(id)) WITH CHECK (public.can_access_project(id));
CREATE POLICY "Owner deletes projects" ON public.console_projects FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Team sees members" ON public.console_members FOR SELECT TO authenticated USING (public.can_access_project(project_id));
CREATE POLICY "Owner adds members" ON public.console_members FOR INSERT TO authenticated WITH CHECK (public.owns_project(project_id));
CREATE POLICY "Owner removes members" ON public.console_members FOR DELETE TO authenticated USING (public.owns_project(project_id));

CREATE POLICY "Team sees tasks" ON public.console_tasks FOR SELECT TO authenticated USING (public.can_access_project(project_id));
CREATE POLICY "Team adds tasks" ON public.console_tasks FOR INSERT TO authenticated WITH CHECK (public.can_access_project(project_id) AND created_by = auth.uid());
CREATE POLICY "Team updates tasks" ON public.console_tasks FOR UPDATE TO authenticated USING (public.can_access_project(project_id));
CREATE POLICY "Team deletes tasks" ON public.console_tasks FOR DELETE TO authenticated USING (public.can_access_project(project_id));