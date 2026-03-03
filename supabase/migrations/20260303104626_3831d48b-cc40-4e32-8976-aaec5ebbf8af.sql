
-- ============================================
-- KINGBET EXCHANGE: FULL PRODUCTION SCHEMA
-- ============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'superadmin');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'blocked');
CREATE TYPE public.bet_type AS ENUM ('back', 'lay', 'fancy_yes', 'fancy_no', 'session_over', 'session_under', 'casino', 'crash', 'dice', 'mines', 'plinko', 'aviator', 'teen_patti');
CREATE TYPE public.bet_status AS ENUM ('pending', 'matched', 'won', 'lost', 'void', 'cancelled');
CREATE TYPE public.txn_type AS ENUM ('deposit', 'withdrawal', 'bet_debit', 'bet_win', 'bet_refund', 'admin_credit', 'admin_debit', 'bonus_credit', 'adjustment');
CREATE TYPE public.market_status AS ENUM ('open', 'suspended', 'closed', 'settled');
CREATE TYPE public.sport_type AS ENUM ('cricket', 'football', 'tennis');
CREATE TYPE public.game_type AS ENUM ('aviator', 'plinko', 'crash', 'dice', 'mines', 'teen_patti', 'casino');

-- 2. USER ROLES TABLE (security best practice: roles in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  status account_status NOT NULL DEFAULT 'active',
  parent_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. WALLETS TABLE
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  bonus_balance NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
  exposure NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (exposure >= 0),
  total_profit_loss NUMERIC(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 5. MARKETS TABLE
CREATE TABLE public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  competition TEXT NOT NULL,
  sport sport_type NOT NULL,
  status market_status NOT NULL DEFAULT 'open',
  start_time TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- 6. RUNNERS TABLE
CREATE TABLE public.runners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  back_odds NUMERIC(8,2) NOT NULL DEFAULT 0,
  lay_odds NUMERIC(8,2) NOT NULL DEFAULT 0,
  back_size NUMERIC(12,2) NOT NULL DEFAULT 0,
  lay_size NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_winner BOOLEAN DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runners ENABLE ROW LEVEL SECURITY;

-- 7. BETS TABLE
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID REFERENCES public.markets(id),
  runner_id UUID REFERENCES public.runners(id),
  game_type game_type,
  game_round_id TEXT,
  bet_type bet_type NOT NULL,
  odds NUMERIC(10,2) NOT NULL,
  stake NUMERIC(12,2) NOT NULL CHECK (stake > 0),
  potential_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_profit NUMERIC(12,2) DEFAULT NULL,
  exposure NUMERIC(12,2) NOT NULL DEFAULT 0,
  status bet_status NOT NULL DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bets_user ON public.bets(user_id);
CREATE INDEX idx_bets_market ON public.bets(market_id);
CREATE INDEX idx_bets_status ON public.bets(status);

-- 8. TRANSACTIONS (LEDGER) TABLE
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type txn_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_before NUMERIC(15,2) NOT NULL,
  balance_after NUMERIC(15,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_txn_user ON public.transactions(user_id);
CREATE INDEX idx_txn_created ON public.transactions(created_at DESC);

-- 9. GAME ROUNDS TABLE (casino games)
CREATE TABLE public.game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game game_type NOT NULL,
  round_data JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  multiplier NUMERIC(10,4),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

-- 10. GAME PARTICIPATION LOGS
CREATE TABLE public.game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game game_type NOT NULL,
  round_id UUID REFERENCES public.game_rounds(id),
  bet_id UUID REFERENCES public.bets(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_game_logs_user ON public.game_logs(user_id);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Get user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = uid LIMIT 1;
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(uid UUID, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = _role
  );
$$;

-- Check if user is admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin_or_above(uid UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role IN ('admin', 'superadmin')
  );
$$;

-- Check if user is in downline of admin
CREATE OR REPLACE FUNCTION public.is_in_downline(admin_uid UUID, target_uid UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_uid AND parent_id = admin_uid
  ) OR public.has_role(admin_uid, 'superadmin');
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles: users see own, admins see downline, super sees all
CREATE POLICY "Users see own role" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'superadmin'));

-- profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- wallets: users see own, admins see downline
CREATE POLICY "Users see own wallet" ON public.wallets FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "System inserts wallets" ON public.wallets FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "System updates wallets" ON public.wallets FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));

-- markets: public read
CREATE POLICY "Markets are public" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Admins manage markets" ON public.markets FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- runners: public read
CREATE POLICY "Runners are public" ON public.runners FOR SELECT USING (true);
CREATE POLICY "Admins manage runners" ON public.runners FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- bets: users see own, admins see all
CREATE POLICY "Users see own bets" ON public.bets FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Users place own bets" ON public.bets FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "System updates bets" ON public.bets FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));

-- transactions: users see own, admins see all
CREATE POLICY "Users see own transactions" ON public.transactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "System inserts transactions" ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));

-- game_rounds: public read
CREATE POLICY "Game rounds public" ON public.game_rounds FOR SELECT USING (true);
CREATE POLICY "Admins manage rounds" ON public.game_rounds FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- game_logs: users see own
CREATE POLICY "Users see own game logs" ON public.game_logs FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above(auth.uid()));
CREATE POLICY "Users insert own game logs" ON public.game_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- AUTO-CREATE PROFILE + WALLET ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
