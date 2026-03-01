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

  const [users, setUsers] = useState<User[]>(() => {
    const list = [...mockUsers];
    if (!list.find((u) => u.username === 'Pratik00')) {
      list.push({
        id: 'super-pratik-01',
        username: 'Pratik00',
        password: 'password123',
        role: 'superadmin',
        balance: 1000000,
        parentId: null,
        createdAt: new Date().toISOString(),
      });
    }
    return list;
  });

  const [markets] = useState<Market[]>(mockMarkets);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  const currentUser: User = authUser
    ? (users.find((u) => u.username === authUser.username) || {
        ...authUser,
        id: authUser.id,
        username: authUser.username,
        password: '',
        role: authUser.username === 'Pratik00' ? 'superadmin' : authUser.role,
        balance: authUser.balance || 0,
        parentId: null,
        createdAt: new Date().toISOString(),
      })
    : guestUser;

  const logout = useCallback(() => {
    authLogout();
    localStorage.clear();
    navigate('/login', { replace: true });
  }, [authLogout, navigate]);

  const getDownlineUsers = useCallback((pid: string) => users.filter((u) => u.parentId === pid), [users]);

  const addPoints = useCallback((uid: string, amt: number) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, balance: u.balance + amt } : u)));
  }, []);

  const removePoints = useCallback((uid: string, amt: number) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, balance: Math.max(0, u.balance - amt) } : u)));
  }, []);

  const createUser = useCallback((un: string, pw: string, r: Role, pid: string) => {
    const newUser: User = { id: `u${Date.now()}`, username: un, password: pw, role: r, balance: 0, parentId: pid, createdAt: new Date().toISOString() };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }, []);

  const changeRole = useCallback((uid: string, nr: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: nr } : u)));
  }, []);

  const addToBetSlip = useCallback((item: any) => {
    setBetSlip((prev) => (prev.some((b) => b.runnerId === item.runnerId) ? prev : [...prev, { ...item, stake: 0 }]));
  }, []);

  const removeFromBetSlip = useCallback((rid: string) => {
    setBetSlip((prev) => prev.filter((b) => b.runnerId !== rid));
  }, []);

  const updateBetSlipStake = useCallback((rid: string, s: number) => {
    setBetSlip((prev) => prev.map((b) => (b.runnerId === rid ? { ...b, stake: s } : b)));
  }, []);

  const placeBets = useCallback(() => {
    const total = betSlip.reduce((s, b) => s + b.stake, 0);
    if (total > 0 && total <= currentUser.balance) {
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, balance: u.balance - total } : u)));
      setBetSlip([]);
    }
  }, [betSlip, currentUser]);

  const clearBetSlip = useCallback(() => setBetSlip([]), []);

  return (
    <AppContext.Provider
      value={{
        currentUser, users, getDownlineUsers, addPoints, removePoints, createUser, changeRole,
        markets, bets, betSlip, addToBetSlip, removeFromBetSlip, updateBetSlipStake, placeBets, clearBetSlip, transactions, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default AppContext;
