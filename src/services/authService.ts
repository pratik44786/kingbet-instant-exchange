import { mockUsers } from '@/data/mockData';
import type { User } from '@/types/exchange';

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    role: 'user' | 'admin' | 'superadmin';
    balance: number;
  };
  token: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const token = `mock_token_${user.id}_${Date.now()}`;

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
      token,
    };
  },

  adminLogin: async (userId: string): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.id === userId);

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      throw new Error('Invalid User ID or insufficient privileges');
    }

    const token = `mock_admin_token_${user.id}_${Date.now()}`;

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
      token,
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
  },
};
