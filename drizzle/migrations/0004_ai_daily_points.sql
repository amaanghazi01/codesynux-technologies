CREATE TABLE public.ai_daily_usage (
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  points integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
GRANT SELECT ON public.ai_daily_usage TO authenticated;
GRANT ALL ON public.ai_daily_usage TO service_role;
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own usage read" ON public.ai_daily_usage FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.ai_points_status()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'unlimited', public.has_console_access(auth.uid()),
    'limit', 100,
    'used', COALESCE((SELECT points FROM public.ai_daily_usage WHERE user_id = auth.uid() AND day = (now() AT TIME ZONE 'utc')::date), 0)
  )
$$;

CREATE OR REPLACE FUNCTION public.consume_ai_point()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE used integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF public.has_console_access(auth.uid()) THEN RETURN true; END IF;
  INSERT INTO public.ai_daily_usage(user_id, day, points) VALUES (auth.uid(), (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (user_id, day) DO UPDATE SET points = ai_daily_usage.points + 1 WHERE ai_daily_usage.points < 100
  RETURNING points INTO used;
  RETURN used IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.consume_ai_point() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_point() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_points_status() TO authenticated;