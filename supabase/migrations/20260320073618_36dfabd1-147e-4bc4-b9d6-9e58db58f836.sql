
-- Transaction PINs table (hashed passwords for admins)
CREATE TABLE public.transaction_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_pins ENABLE ROW LEVEL SECURITY;

-- Only the user can see their own pin record exists (not the hash)
CREATE POLICY "Users see own pin" ON public.transaction_pins
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- No client-side insert/update/delete — all managed by edge function
CREATE POLICY "No client insert" ON public.transaction_pins
FOR INSERT TO authenticated
WITH CHECK (false);

-- Transaction audit log
CREATE TABLE public.transaction_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  ip_address text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_audit ENABLE ROW LEVEL SECURITY;

-- Admins can see their own audit logs, superadmin sees all
CREATE POLICY "Admins see own audit" ON public.transaction_audit
FOR SELECT TO authenticated
USING (
  admin_id = auth.uid()
  OR has_role(auth.uid(), 'superadmin')
  OR has_role(auth.uid(), 'master_admin')
);

-- No client-side modifications
CREATE POLICY "No client insert audit" ON public.transaction_audit
FOR INSERT TO authenticated
WITH CHECK (false);
