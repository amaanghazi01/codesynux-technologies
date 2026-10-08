CREATE TABLE public.leaderboard_profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Codesynux member',
  avatar_url text,
  points integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  last_active date,
  referral_code text NOT NULL UNIQUE DEFAULT substr(md5(gen_random_uuid()::text),1,8),
  referred_by uuid,
  referrals integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leaderboard_profiles TO anon, authenticated;
GRANT ALL ON public.leaderboard_profiles TO service_role;
ALTER TABLE public.leaderboard_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is public" ON public.leaderboard_profiles FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.check_in(_ref text DEFAULT NULL, _name text DEFAULT NULL, _avatar text DEFAULT NULL)
RETURNS public.leaderboard_profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); row public.leaderboard_profiles; inviter uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  INSERT INTO leaderboard_profiles(user_id, display_name, avatar_url)
  VALUES (me, coalesce(nullif(left(trim(_name),40),''),'Codesynux member'), _avatar)
  ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO row FROM leaderboard_profiles WHERE user_id = me FOR UPDATE;
  IF row.last_active IS DISTINCT FROM current_date THEN
    UPDATE leaderboard_profiles SET
      streak = CASE WHEN last_active = current_date - 1 THEN streak + 1 ELSE 1 END,
      points = points + 10, last_active = current_date
    WHERE user_id = me;
  END IF;
  IF _ref IS NOT NULL AND row.referred_by IS NULL THEN
    SELECT user_id INTO inviter FROM leaderboard_profiles WHERE referral_code = _ref AND user_id <> me;
    IF inviter IS NOT NULL THEN
      UPDATE leaderboard_profiles SET referred_by = inviter, points = points + 50 WHERE user_id = me;
      UPDATE leaderboard_profiles SET referrals = referrals + 1, points = points + 100 WHERE user_id = inviter;
    END IF;
  END IF;
  SELECT * INTO row FROM leaderboard_profiles WHERE user_id = me;
  RETURN row;
END $$;
REVOKE EXECUTE ON FUNCTION public.check_in(text,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.check_in(text,text,text) TO authenticated;