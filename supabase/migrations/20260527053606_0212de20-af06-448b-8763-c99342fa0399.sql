
REVOKE ALL ON FUNCTION public.distribute_profit_to_investment(uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.distribute_profit_to_investment(uuid, numeric) TO service_role;
