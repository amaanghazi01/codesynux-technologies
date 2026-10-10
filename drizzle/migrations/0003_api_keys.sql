CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT 'My key',
  prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  revoked boolean NOT NULL DEFAULT false,
  requests integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own keys read" ON public.api_keys FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'owner'));
CREATE POLICY "Own keys update" ON public.api_keys FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'owner')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'owner'));
CREATE POLICY "Own keys delete" ON public.api_keys FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.api_usage (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status integer NOT NULL DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX api_usage_key_time ON public.api_usage(key_id, created_at DESC);
GRANT SELECT ON public.api_usage TO authenticated;
GRANT ALL ON public.api_usage TO service_role;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usage read" ON public.api_usage FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'owner'));