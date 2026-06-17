CREATE OR REPLACE FUNCTION public.get_my_referrals()
RETURNS TABLE (
  referred_user_id uuid,
  username text,
  full_name text,
  level integer,
  total_commission numeric,
  kyc_status text,
  joined_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.referred_user_id,
         p.username,
         p.full_name,
         r.level,
         r.total_commission,
         p.kyc_status,
         r.created_at
  FROM public.referrals r
  JOIN public.profiles p ON p.id = r.referred_user_id
  WHERE r.referrer_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_referrals() TO authenticated;