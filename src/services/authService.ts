// Auth is handled by Supabase via AuthContext. This file is kept for backwards compatibility.
// All authentication flows go through src/context/AuthContext.tsx

export const authService = {
  login: async (_username: string, _password: string) => {
    throw new Error('Use AuthContext.login() instead');
  },
  logout: async () => {
    throw new Error('Use AuthContext.logout() instead');
  },
};
