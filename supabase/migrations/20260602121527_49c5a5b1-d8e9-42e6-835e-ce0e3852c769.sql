CREATE UNIQUE INDEX IF NOT EXISTS transactions_unique_payment_request_idx
ON public.transactions (reference_type, reference_id, type)
WHERE reference_id IS NOT NULL
  AND reference_type IN ('deposit', 'withdrawal')
  AND type IN ('deposit', 'withdrawal');