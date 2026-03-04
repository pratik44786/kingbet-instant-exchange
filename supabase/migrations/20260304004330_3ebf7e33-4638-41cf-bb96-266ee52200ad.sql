-- Create the trigger for auto-creating profiles, wallets, and roles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for wallets so balance updates show instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;