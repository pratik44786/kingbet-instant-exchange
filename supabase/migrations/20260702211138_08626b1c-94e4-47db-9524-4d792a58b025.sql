CREATE OR REPLACE FUNCTION public.get_recent_payouts(_limit integer DEFAULT 12)
RETURNS TABLE(masked_name text, amount numeric, crypto_symbol text, paid_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(NULLIF(left(p.full_name, 1), ''), left(p.username, 1)) || '***' AS masked_name,
    w.amount,
    w.crypto_symbol,
    w.reviewed_at AS paid_at
  FROM public.withdrawals w
  LEFT JOIN public.profiles p ON p.id = w.user_id
  WHERE w.status = 'approved'
  ORDER BY w.reviewed_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(_limit, 50));
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_payouts(integer) TO anon, authenticated;