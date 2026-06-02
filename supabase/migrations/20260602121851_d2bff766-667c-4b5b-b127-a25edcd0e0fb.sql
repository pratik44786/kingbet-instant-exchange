CREATE OR REPLACE FUNCTION public.process_kyc_review(
  _kyc_id uuid,
  _admin_id uuid,
  _status text,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k public.kyc_submissions%ROWTYPE;
BEGIN
  IF _status NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_status');
  END IF;

  SELECT * INTO k
  FROM public.kyc_submissions
  WHERE id = _kyc_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF k.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_processed', 'status', k.status, 'user_id', k.user_id);
  END IF;

  UPDATE public.kyc_submissions
  SET status = _status,
      reviewed_at = now(),
      reviewed_by = _admin_id,
      admin_note = _note,
      updated_at = now()
  WHERE id = _kyc_id;

  UPDATE public.profiles
  SET kyc_status = _status,
      updated_at = now()
  WHERE id = k.user_id;

  RETURN jsonb_build_object('ok', true, 'user_id', k.user_id, 'status', _status);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_kyc_review(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_kyc_review(uuid, uuid, text, text) TO service_role;