-- Fix game_logs INSERT policy: only service role should insert
DROP POLICY IF EXISTS "Users insert own game logs" ON public.game_logs;
CREATE POLICY "Only service role inserts game logs" ON public.game_logs FOR INSERT TO authenticated WITH CHECK (false);