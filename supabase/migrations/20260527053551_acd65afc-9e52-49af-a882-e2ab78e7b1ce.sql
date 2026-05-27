
-- KYC submissions
CREATE TABLE public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  document_type text NOT NULL,
  document_number text NOT NULL,
  country text,
  front_image_url text NOT NULL,
  back_image_url text,
  selfie_image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own kyc" ON public.kyc_submissions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Users insert own kyc" ON public.kyc_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update kyc" ON public.kyc_submissions FOR UPDATE
  USING (public.is_admin_or_above(auth.uid()));

CREATE TRIGGER kyc_updated_at BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- KYC docs storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-docs', 'kyc-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own kyc docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own kyc docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-docs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_above(auth.uid())));

-- Profit distribution helper used by edge function cron
CREATE OR REPLACE FUNCTION public.distribute_profit_to_investment(_investment_id uuid, _profit numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid;
  _bal numeric;
BEGIN
  SELECT user_id INTO _user FROM public.investments WHERE id = _investment_id;
  IF _user IS NULL THEN RETURN; END IF;

  UPDATE public.investments
     SET total_profit_earned = total_profit_earned + _profit,
         last_payout_at = now()
   WHERE id = _investment_id;

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _user FOR UPDATE;
  UPDATE public.wallets
     SET balance = balance + _profit,
         total_profit_loss = total_profit_loss + _profit,
         updated_at = now()
   WHERE user_id = _user;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
  VALUES (_user, 'profit', _profit, _bal, _bal + _profit, 'Investment profit payout', _investment_id, 'investment');
END;
$$;
