
-- Update is_admin_or_above function to include master_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_above(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role IN ('admin', 'master_admin', 'superadmin')
  );
$$;

-- Allow master_admin to also see user_roles
DROP POLICY IF EXISTS "Users see own role" ON public.user_roles;
CREATE POLICY "Users see own role" ON public.user_roles
FOR SELECT TO public
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'superadmin')
  OR has_role(auth.uid(), 'master_admin')
);
