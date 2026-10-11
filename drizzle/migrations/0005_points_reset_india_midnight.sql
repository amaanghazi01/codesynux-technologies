ALTER TABLE public.ai_daily_usage ALTER COLUMN day SET DEFAULT (now() AT TIME ZONE 'Asia/Kolkata')::date;
CREATE OR REPLACE FUNCTION public.ai_points_status()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'unlimited', public.has_console_access(auth.uid()),
    'limit', 100,
    'used', COALESCE((SELECT points FROM public.ai_daily_usage WHERE user_id = auth.uid() AND day = (now() AT TIME ZONE 'Asia/Kolkata')::date), 0)
  )
$$;
CREATE OR REPLACE FUNCTION public.consume_ai_point()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE used integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF public.has_console_access(auth.uid()) THEN RETURN true; END IF;
  INSERT INTO public.ai_daily_usage(user_id, day, points) VALUES (auth.uid(), (now() AT TIME ZONE 'Asia/Kolkata')::date, 1)
  ON CONFLICT (user_id, day) DO UPDATE SET points = ai_daily_usage.points + 1 WHERE ai_daily_usage.points < 100
  RETURNING points INTO used;
  RETURN used IS NOT NULL;
END $$;