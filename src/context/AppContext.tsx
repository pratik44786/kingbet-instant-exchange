import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { mockUsers, mockMarkets, mockBets, mockTransactions } from '@/data/mockData';
import type { User, Market, Bet, Transaction, BetSlipItem, Role } from '@/types/exchange';

interface AppContextType {
  currentUser: User;
  users: User[];
  getDownlineUsers: (parentId: string) => User[];
  addPoints: (userId: string, amount: number) => void;
  removePoints: (userId: string, amount: number) => void;
  createUser: (username: string, password: string, role: Role, parentId: string) => User | null;
  changeRole: (userId: string, newRole: Role) => void;
  markets: Market[];
  bets: Bet[];
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  removeFromBetSlip: (runnerId: string) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => void;
  clearBetSlip: () => void;
  transactions: Transaction[];
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const guestUser: User = {
  id: 'guest',
  username: 'Guest',
  password: '',
  role: 'user',
  balance: 0,
  parentId: null,
  createdAt: new Date().toISOString(),
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  // 1. Initial State with Pratik00 as Superadmin
  const [users, setUsers] = useState<User[]>(() => {
    const existingUsers = [...mockUsers];
    if (!existingUsers.find(u => u.username === 'Pratik00')) {
      existingUsers.push({
        id: 'super-pratik-01',
        username: 'Pratik00',
        password: 'password123',
        role: 'superadmin',
        balance: 1000000,
        parentId: null,
        createdAt: new Date().toISOString(),
      });
    }
    return existingUsers;
  });

  const [markets] = useState<Market[]>(mockMarkets);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  // 2. Forced Superadmin Logic for Pratik00
  const currentUser: User = authUser
    ? (users.find((u) => u.username === authUser.username) ?? {
        id: authUser.id,
        username: authUser.username,
        password: '',
        role: authUser.username === 'Pratik00' ? 'superadmin' : authUser.role,
        balance: authUser.balance ?? 0,
        parentId: null,
        createdAt: new Date().toISOString(),
      })
    : guestUser;

  const logout = useCallback(() => {
    authLogout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('userIdLogin');
    navigate('/login', { replace: true });
  }, [authLogout, navigate]);

  const getDownlineUsers = useCallback(
    (parentId: string) => users.filter((u) => u.parentId === parentId),
    [users]
  );

  const addPoints = useCallback(
    (userId: string, amount: number) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, balance: u.balance + amount } : u))
      );
    },
    []
  );

  const removePoints = useCallback(
    (userId: string, amount: number) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, balance: Math.max(0, u.balance - amount) } : u
        )
      );
    },
    []
  );

  const createUser = useCallback(
    (username: string, password: string, role: Role, parentId: string): User | null => {
      if (users.some((u) => u.username === username)) return null;
      const newUser: User = {
        id: `u${Date.now()}`,
        username,
        password,
        role,
        balance: 0,
        parentId,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    },
    [users]
  );

  const changeRole = useCallback((userId: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  }, []);

  const addToBetSlip = useCallback((item: Omit<BetSlipItem, 'stake'>) => {
    setBetSlip((prev) => {
      if (prev.some((b) => b.runnerId === item.runnerId && b.type === item.type)) return prev;
      return [...prev, { ...item, stake: 0 }];
    });
  }, []);

  const removeFromBetSlip = useCallback((runnerId: string) => {
    setBetSlip((prev) => prev.filter((b) => b.runnerId !== runnerId));
  }, []);

  const updateBetSlipStake = useCallback((runnerId: string, stake: number) => {
    setBetSlip((prev) => prev.map((b) => (b.runnerId === runnerId ? { ...b, stake } : b)));
  }, []);

  const placeBets = useCallback(() => {
    const validBets = betSlip.filter((b) => b.stake > 0);
    if (validBets.length === 0) return;

    const totalStake = validBets.reduce((s, b) => s + b.stake, 0);
    if (totalStake > currentUser.balance) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: u.balance - totalStake } : u))
    );

    const newBets: Bet[] = validBets.map((b) => ({
      id: `b${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      marketId: b.marketId,
      runnerId: b.runnerId,
      runnerName: b.runnerName,
      type: b.type,
      odds: b.odds,
      stake: b.stake,
      potentialProfit: b.type === 'back' ? Math.floor((b.odds - 1) * b.stake) : b.stake,
      status: 'matched' as const,
      timestamp: new Date().toISOString(),
    }));

    setBets((prev) => [...newBets, ...prev]);
    setBetSlip([]);
  }, [betSlip, currentUser]);

  const clearBetSlip = useCallback(() => {
    setBetSlip([]);
  }, []);

  const value: AppContextType = {
    currentUser,
    users,
    getDownlineUsers,
    addPoints,
    removePoints,
    createUser,
    changeRole,
    markets,
    bets,
    betSlip,
    addToBetSlip,
    removeFromBetSlip,
    updateBetSlipStake,
    placeBets,
    clearBetSlip,
    transactions,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
