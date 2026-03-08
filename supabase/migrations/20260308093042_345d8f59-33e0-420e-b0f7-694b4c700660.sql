
-- Create a trigger function that auto-refills superadmin balance
CREATE OR REPLACE FUNCTION public.auto_refill_superadmin_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the user is a superadmin
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'superadmin'
  ) THEN
    -- Always keep superadmin balance at 99999999
    IF NEW.balance < 99999999 THEN
      NEW.balance := 99999999;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on wallets table
CREATE TRIGGER trg_auto_refill_superadmin
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_refill_superadmin_balance();
