CREATE OR REPLACE FUNCTION public.process_deposit_rejection(
  _deposit_id uuid,
  _admin_id uuid,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.deposits%ROWTYPE;
BEGIN
  SELECT * INTO d
  FROM public.deposits
  WHERE id = _deposit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF d.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_processed', 'status', d.status, 'user_id', d.user_id, 'amount', d.amount, 'crypto_symbol', d.crypto_symbol);
  END IF;

  UPDATE public.deposits
  SET status = 'rejected',
      reviewed_at = now(),
      reviewed_by = _admin_id,
      admin_note = _note
  WHERE id = _deposit_id;

  RETURN jsonb_build_object('ok', true, 'user_id', d.user_id, 'amount', d.amount, 'crypto_symbol', d.crypto_symbol);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_deposit_rejection(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_deposit_rejection(uuid, uuid, text) TO service_role;