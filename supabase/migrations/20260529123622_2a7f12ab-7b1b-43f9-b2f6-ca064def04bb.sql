CREATE TABLE public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL DEFAULT 'KINGBET EXCHANGE',
  ceo_name text,
  founder_name text,
  support_email text DEFAULT 'support@kingbetexchange.live',
  support_phone text,
  office_address text,
  twitter_url text,
  facebook_url text,
  instagram_url text,
  telegram_url text,
  logo_url text,
  favicon_url text,
  tagline text DEFAULT 'Smart Crypto Investing Platform',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.company_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company settings public read"
ON public.company_settings FOR SELECT
USING (true);

CREATE POLICY "Admins manage company settings"
ON public.company_settings FOR ALL
USING (is_admin_or_above(auth.uid()))
WITH CHECK (is_admin_or_above(auth.uid()));

CREATE TRIGGER company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.company_settings (company_name, support_email, tagline)
VALUES ('KINGBET EXCHANGE', 'support@kingbetexchange.live', 'Smart Crypto Investing Platform');