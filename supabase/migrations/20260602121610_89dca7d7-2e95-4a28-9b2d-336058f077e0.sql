CREATE OR REPLACE FUNCTION public.process_deposit_approval(
  _deposit_id uuid,
  _admin_id uuid,
  _tx_hash text DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.deposits%ROWTYPE;
  before_balance numeric;
  after_balance numeric;
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

  SELECT balance INTO before_balance
  FROM public.wallets
  WHERE user_id = d.user_id
  FOR UPDATE;

  before_balance := COALESCE(before_balance, 0);
  after_balance := before_balance + d.amount;

  UPDATE public.wallets
  SET balance = after_balance,
      updated_at = now()
  WHERE user_id = d.user_id;

  UPDATE public.deposits
  SET status = 'approved',
      transaction_hash = COALESCE(NULLIF(_tx_hash, ''), d.transaction_hash),
      reviewed_at = now(),
      reviewed_by = _admin_id,
      admin_note = _note
  WHERE id = _deposit_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
  VALUES (d.user_id, 'deposit', d.amount, before_balance, after_balance, 'Deposit approved (' || d.crypto_symbol || ')', d.id, 'deposit');

  RETURN jsonb_build_object('ok', true, 'user_id', d.user_id, 'amount', d.amount, 'crypto_symbol', d.crypto_symbol);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal_approval(
  _withdrawal_id uuid,
  _admin_id uuid,
  _tx_hash text DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wd public.withdrawals%ROWTYPE;
  current_balance numeric;
  current_pending numeric;
  next_pending numeric;
BEGIN
  SELECT * INTO wd
  FROM public.withdrawals
  WHERE id = _withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF wd.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_processed', 'status', wd.status, 'user_id', wd.user_id, 'amount', wd.amount, 'crypto_symbol', wd.crypto_symbol);
  END IF;

  SELECT balance, pending_withdrawal INTO current_balance, current_pending
  FROM public.wallets
  WHERE user_id = wd.user_id
  FOR UPDATE;

  current_balance := COALESCE(current_balance, 0);
  current_pending := COALESCE(current_pending, 0);
  next_pending := GREATEST(0, current_pending - wd.amount);

  UPDATE public.wallets
  SET pending_withdrawal = next_pending,
      updated_at = now()
  WHERE user_id = wd.user_id;

  UPDATE public.withdrawals
  SET status = 'approved',
      transaction_hash = COALESCE(NULLIF(_tx_hash, ''), wd.transaction_hash),
      reviewed_at = now(),
      reviewed_by = _admin_id,
      admin_note = _note
  WHERE id = _withdrawal_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
  VALUES (wd.user_id, 'withdrawal', -wd.amount, current_balance, current_balance, 'Withdrawal approved (' || wd.crypto_symbol || ')', wd.id, 'withdrawal');

  RETURN jsonb_build_object('ok', true, 'user_id', wd.user_id, 'amount', wd.amount, 'crypto_symbol', wd.crypto_symbol);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal_rejection(
  _withdrawal_id uuid,
  _admin_id uuid,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wd public.withdrawals%ROWTYPE;
  before_balance numeric;
  after_balance numeric;
  current_pending numeric;
BEGIN
  SELECT * INTO wd
  FROM public.withdrawals
  WHERE id = _withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF wd.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_processed', 'status', wd.status, 'user_id', wd.user_id, 'amount', wd.amount, 'crypto_symbol', wd.crypto_symbol);
  END IF;

  SELECT balance, pending_withdrawal INTO before_balance, current_pending
  FROM public.wallets
  WHERE user_id = wd.user_id
  FOR UPDATE;

  before_balance := COALESCE(before_balance, 0);
  current_pending := COALESCE(current_pending, 0);
  after_balance := before_balance + wd.amount;

  UPDATE public.wallets
  SET balance = after_balance,
      pending_withdrawal = GREATEST(0, current_pending - wd.amount),
      updated_at = now()
  WHERE user_id = wd.user_id;

  UPDATE public.withdrawals
  SET status = 'rejected',
      reviewed_at = now(),
      reviewed_by = _admin_id,
      admin_note = _note
  WHERE id = _withdrawal_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
  VALUES (wd.user_id, 'admin_adjustment', wd.amount, before_balance, after_balance, 'Withdrawal rejected — refund', wd.id, 'withdrawal');

  RETURN jsonb_build_object('ok', true, 'user_id', wd.user_id, 'amount', wd.amount, 'crypto_symbol', wd.crypto_symbol);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_deposit_approval(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal_approval(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal_rejection(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_deposit_approval(uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_approval(uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_rejection(uuid, uuid, text) TO service_role;