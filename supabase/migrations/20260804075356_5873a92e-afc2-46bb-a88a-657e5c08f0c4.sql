UPDATE public.investment_plans
SET min_deposit = 10,
    duration_days = 90,
    updated_at = now()
WHERE name = 'Starter';