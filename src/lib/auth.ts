import { supabase } from '@/integrations/supabase/client';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('userIdLogin');
  window.location.href = '/';
}
