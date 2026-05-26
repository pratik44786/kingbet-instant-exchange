
-- Drop old betting/casino tables
DROP TABLE IF EXISTS public.bets CASCADE;
DROP TABLE IF EXISTS public.runners CASCADE;
DROP TABLE IF EXISTS public.markets CASCADE;
DROP TABLE IF EXISTS public.game_logs CASCADE;
DROP TABLE IF EXISTS public.game_rounds CASCADE;
DROP TABLE IF EXISTS public.transaction_pins CASCADE;
DROP TABLE IF EXISTS public.transaction_audit CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS public.bet_type CASCADE;
DROP TYPE IF EXISTS public.bet_status CASCADE;
DROP TYPE IF EXISTS public.market_status CASCADE;
DROP TYPE IF EXISTS public.sport_type CASCADE;
DROP TYPE IF EXISTS public.game_type CASCADE;

-- Modify profiles for crypto platform
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS two_fa_enabled boolean NOT NULL DEFAULT false;

-- Modify wallets - drop betting columns, keep balance
ALTER TABLE public.wallets
  DROP COLUMN IF EXISTS exposure,
  DROP COLUMN IF EXISTS bonus_balance;

ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS active_investment numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_earnings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_withdrawal numeric NOT NULL DEFAULT 0;

-- Drop old transaction enum and recreate
DROP TYPE IF EXISTS public.transaction_type CASCADE;
CREATE TYPE public.transaction_type AS ENUM (
  'deposit', 'withdrawal', 'investment', 'profit', 'referral_commission', 'admin_adjustment'
);

-- Recreate transactions table cleanly
DROP TABLE IF EXISTS public.transactions CASCADE;
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.transaction_type NOT NULL,
  amount numeric NOT NULL,
  balance_before numeric NOT NULL DEFAULT 0,
  balance_after numeric NOT NULL DEFAULT 0,
  description text,
  reference_id uuid,
  reference_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own transactions" ON public.transactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));

-- Investment plans (admin managed)
CREATE TABLE public.investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  monthly_return_percent numeric NOT NULL DEFAULT 5,
  min_deposit numeric NOT NULL DEFAULT 100,
  max_deposit numeric NOT NULL DEFAULT 1000000,
  duration_days integer NOT NULL DEFAULT 30,
  payout_frequency text NOT NULL DEFAULT 'fortnightly',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans public read" ON public.investment_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.investment_plans FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- Investments
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.investment_plans(id),
  amount numeric NOT NULL,
  monthly_return_percent numeric NOT NULL,
  total_profit_earned numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  last_payout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own investments" ON public.investments FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "No client write investments" ON public.investments FOR INSERT WITH CHECK (false);
CREATE POLICY "Admins update investments" ON public.investments FOR UPDATE
  USING (public.is_admin_or_above(auth.uid()));

-- Deposit addresses (admin-managed crypto wallets)
CREATE TABLE public.deposit_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_symbol text NOT NULL,
  crypto_name text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL,
  qr_image_url text,
  min_deposit numeric NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deposit_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deposit addresses public read" ON public.deposit_addresses FOR SELECT USING (is_active = true OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Admins manage deposit addresses" ON public.deposit_addresses FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- Deposits
CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crypto_symbol text NOT NULL,
  network text NOT NULL,
  amount numeric NOT NULL,
  transaction_hash text,
  proof_image_url text,
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own deposits" ON public.deposits FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Users create own deposits" ON public.deposits FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update deposits" ON public.deposits FOR UPDATE
  USING (public.is_admin_or_above(auth.uid()));

-- Withdrawals
CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  crypto_symbol text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  transaction_hash text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own withdrawals" ON public.withdrawals FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Users create own withdrawals" ON public.withdrawals FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update withdrawals" ON public.withdrawals FOR UPDATE
  USING (public.is_admin_or_above(auth.uid()));

-- Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  total_commission numeric NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));

-- Update handle_new_user to include referral code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code text;
  ref_by_code text;
  ref_by_id uuid;
BEGIN
  -- Generate unique referral code
  ref_code := upper(substring(md5(NEW.id::text || random()::text), 1, 8));

  -- Check if a referral code was provided
  ref_by_code := NEW.raw_user_meta_data->>'referral_code';
  IF ref_by_code IS NOT NULL AND length(ref_by_code) > 0 THEN
    SELECT id INTO ref_by_id FROM public.profiles WHERE referral_code = upper(ref_by_code) LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, username, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    ref_code,
    ref_by_id
  );

  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  IF ref_by_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_user_id, level)
    VALUES (ref_by_id, NEW.id, 1);
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for deposit proofs and QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-proofs', 'deposit-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('crypto-qr', 'crypto-qr', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own deposit proofs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deposit-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users see own deposit proofs" ON storage.objects FOR SELECT
  USING (bucket_id = 'deposit-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_above(auth.uid())));
CREATE POLICY "QR images public" ON storage.objects FOR SELECT USING (bucket_id = 'crypto-qr');
CREATE POLICY "Admins manage QR" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'crypto-qr' AND public.is_admin_or_above(auth.uid()));

-- Seed a default investment plan
INSERT INTO public.investment_plans (name, description, monthly_return_percent, min_deposit, max_deposit, duration_days, payout_frequency, sort_order)
VALUES
  ('Starter', 'Begin your crypto investment journey', 5, 100, 999, 30, 'fortnightly', 1),
  ('Premium', 'Higher returns for serious investors', 5, 1000, 9999, 30, 'fortnightly', 2),
  ('Elite', 'Maximum returns for elite investors', 5, 10000, 1000000, 30, 'fortnightly', 3);
