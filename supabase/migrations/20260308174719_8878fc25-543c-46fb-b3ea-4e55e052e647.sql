
-- =============================================
-- FIX 1: Wallets — remove user self-update, only admin/service-role can update
-- =============================================
DROP POLICY IF EXISTS "System updates wallets" ON public.wallets;

CREATE POLICY "Only admins update wallets"
  ON public.wallets
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_above(auth.uid()));

-- Also restrict INSERT — wallets are created by handle_new_user trigger (service role)
DROP POLICY IF EXISTS "System inserts wallets" ON public.wallets;

CREATE POLICY "Only system inserts wallets"
  ON public.wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- =============================================
-- FIX 2: Bets — remove direct user INSERT/UPDATE, only service-role/admin
-- =============================================
DROP POLICY IF EXISTS "Users place own bets" ON public.bets;

CREATE POLICY "Only system inserts bets"
  ON public.bets
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "System updates bets" ON public.bets;

CREATE POLICY "Only admins update bets"
  ON public.bets
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_above(auth.uid()));
