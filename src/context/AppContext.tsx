import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Market, User, Bet, Transaction, BetSlipItem, Role } from '@/types/exchange';
import { mockUsers, mockMarkets, mockBets, mockTransactions } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

interface AppContextType {
  // Current user (from auth or mock fallback)
  currentUser: User;

  // Data
  users: User[];
  markets: Market[];
  bets: Bet[];
  transactions: Transaction[];
  betSlip: BetSlipItem[];

  // User management (admin/superadmin)
  addPoints: (userId: string, amount: number) => void;
  removePoints: (userId: string, amount: number) => void;
  createUser: (username: string, password: string, role: 'admin' | 'user', parentId: string) => User | null;
  changeRole: (userId: string, newRole: Role) => void;
  getDownlineUsers: (parentId: string) => User[];

  // Bet slip
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  removeFromBetSlip: (runnerId: string) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => void;
  clearBetSlip: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [markets] = useState<Market[]>(mockMarkets);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  // Derive currentUser from authUser or fallback to first mock user
  const currentUser: User = authUser
    ? users.find(u => u.id === authUser.id) ||
      users.find(u => u.username === authUser.username) || {
        id: authUser.id,
        username: authUser.username,
        password: '',
        role: authUser.role as Role,
        balance: authUser.balance ?? 0,
        parentId: null,
        createdAt: new Date().toISOString(),
      }
    : users[0];

  // Admin: add points to a user
  const addPoints = useCallback((userId: string, amount: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, balance: u.balance + amount } : u))
    );
    setTransactions(prev => [
      {
        id: `t${Date.now()}`,
        type: 'credit',
        amount,
        description: 'Points added by Admin',
        timestamp: new Date().toISOString(),
        balanceAfter: (users.find(u => u.id === userId)?.balance ?? 0) + amount,
      },
      ...prev,
    ]);
  }, [users]);

  // Admin: remove points from a user
  const removePoints = useCallback((userId: string, amount: number) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, balance: Math.max(0, u.balance - amount) } : u
      )
    );
    setTransactions(prev => [
      {
        id: `t${Date.now()}`,
        type: 'debit',
        amount,
        description: 'Points removed by Admin',
        timestamp: new Date().toISOString(),
        balanceAfter: Math.max(0, (users.find(u => u.id === userId)?.balance ?? 0) - amount),
      },
      ...prev,
    ]);
  }, [users]);

  // Admin/SuperAdmin: create a new user
  const createUser = useCallback(
    (username: string, password: string, role: 'admin' | 'user', parentId: string): User | null => {
      if (users.some(u => u.username === username)) return null;
      const newUser: User = {
        id: `u${Date.now()}`,
        username,
        password,
        role,
        balance: 0,
        parentId,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    },
    [users]
  );

  // SuperAdmin: change a user's role
  const changeRole = useCallback((userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
  }, []);

  // Admin: get all users under a given parent
  const getDownlineUsers = useCallback(
    (parentId: string): User[] => {
      return users.filter(u => u.parentId === parentId);
    },
    [users]
  );

  // Bet slip: add item
  const addToBetSlip = useCallback((item: Omit<BetSlipItem, 'stake'>) => {
    setBetSlip(prev => {
      const exists = prev.find(b => b.runnerId === item.runnerId && b.type === item.type);
      if (exists) return prev;
      return [...prev, { ...item, stake: 0 }];
    });
  }, []);

  // Bet slip: remove item
  const removeFromBetSlip = useCallback((runnerId: string) => {
    setBetSlip(prev => prev.filter(b => b.runnerId !== runnerId));
  }, []);

  // Bet slip: update stake
  const updateBetSlipStake = useCallback((runnerId: string, stake: number) => {
    setBetSlip(prev => prev.map(b => (b.runnerId === runnerId ? { ...b, stake } : b)));
  }, []);

  // Bet slip: place bets
  const placeBets = useCallback(() => {
    const validBets = betSlip.filter(b => b.stake > 0);
    if (validBets.length === 0) return;

    const totalStake = validBets.reduce((s, b) => s + b.stake, 0);
    if (totalStake > currentUser.balance) return;

    const newBets: Bet[] = validBets.map(b => ({
      id: `b${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      marketId: b.marketId,
      runnerId: b.runnerId,
      runnerName: b.runnerName,
      type: b.type as Bet['type'],
      odds: b.odds,
      stake: b.stake,
      potentialProfit:
        b.type === 'back' ? parseFloat(((b.odds - 1) * b.stake).toFixed(2)) : b.stake,
      status: 'matched',
      timestamp: new Date().toISOString(),
    }));

    setBets(prev => [...newBets, ...prev]);

    // Deduct from user balance
    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id ? { ...u, balance: u.balance - totalStake } : u
      )
    );

    // Add transactions
    const newTxns: Transaction[] = validBets.map(b => ({
      id: `t${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'bet_debit' as const,
      amount: b.stake,
      description: `${b.type.replace('_', ' ')} bet: ${b.runnerName} @ ${b.odds}`,
      timestamp: new Date().toISOString(),
      balanceAfter: 0, // will be recalculated
    }));
    setTransactions(prev => [...newTxns, ...prev]);

    setBetSlip([]);
  }, [betSlip, currentUser]);

  // Bet slip: clear
  const clearBetSlip = useCallback(() => {
    setBetSlip([]);
  }, []);

  const value: AppContextType = {
    currentUser,
    users,
    markets,
    bets,
    transactions,
    betSlip,
    addPoints,
    removePoints,
    createUser,
    changeRole,
    getDownlineUsers,
    addToBetSlip,
    removeFromBetSlip,
    updateBetSlipStake,
    placeBets,
    clearBetSlip,
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
