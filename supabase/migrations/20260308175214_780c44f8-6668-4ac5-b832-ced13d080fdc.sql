
-- Fix: Block direct client-side transaction inserts, only service-role (edge functions) can insert
DROP POLICY IF EXISTS "System inserts transactions" ON public.transactions;

CREATE POLICY "Only system inserts transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
