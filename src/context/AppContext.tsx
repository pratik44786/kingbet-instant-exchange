import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { User, Market, Bet, Transaction, BetSlipItem, Role } from '@/types/exchange';
import { mockUsers, mockMarkets, mockBets, mockTransactions } from '@/data/mockData';

interface AppState {
  currentUser: User;
  users: User[];
  markets: Market[];
  bets: Bet[];
  transactions: Transaction[];
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  removeFromBetSlip: (runnerId: string) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => void;
  clearBetSlip: () => void;
  switchUser: (userId: string) => void;
  loginUser: (username: string, password: string) => boolean;
  addPoints: (userId: string, amount: number) => void;
  removePoints: (userId: string, amount: number) => void;
  changeRole: (userId: string, role: Role) => void;
  createUser: (username: string, password: string, role: Role, parentId: string) => User | null;
  getDownlineUsers: (userId: string) => User[];
  getDownlineAdmins: (userId: string) => User[];
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

function fluctuateOdds(odds: [number, number, number]): [number, number, number] {
  return odds.map(o => {
    const change = (Math.random() - 0.5) * 0.04;
    return Math.max(1.01, parseFloat((o + change).toFixed(2)));
  }) as [number, number, number];
}

function fluctuateSizes(sizes: [number, number, number]): [number, number, number] {
  return sizes.map(s => {
    const change = Math.floor((Math.random() - 0.5) * 2000);
    return Math.max(100, s + change);
  }) as [number, number, number];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Real-time odds simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        runners: m.runners.map(r => ({
          ...r,
          backOdds: fluctuateOdds(r.backOdds),
          layOdds: fluctuateOdds(r.layOdds),
          backSizes: fluctuateSizes(r.backSizes),
          laySizes: fluctuateSizes(r.laySizes),
        })),
        fancyOdds: m.fancyOdds?.map(f => ({
          ...f,
          yesValue: Math.max(1, f.yesValue + Math.floor((Math.random() - 0.5) * 3)),
          noValue: Math.max(1, f.noValue + Math.floor((Math.random() - 0.5) * 3)),
        })),
        sessionOdds: m.sessionOdds?.map(s => ({
          ...s,
          overValue: Math.max(1, s.overValue + Math.floor((Math.random() - 0.5) * 4)),
          underValue: Math.max(1, s.underValue + Math.floor((Math.random() - 0.5) * 4)),
        })),
      })));
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const addToBetSlip = useCallback((item: Omit<BetSlipItem, 'stake'>) => {
    setBetSlip(prev => {
      const exists = prev.find(b => b.runnerId === item.runnerId && b.type === item.type);
      if (exists) return prev;
      return [...prev, { ...item, stake: 0 }];
    });
  }, []);

  const removeFromBetSlip = useCallback((runnerId: string) => {
    setBetSlip(prev => prev.filter(b => b.runnerId !== runnerId));
  }, []);

  const updateBetSlipStake = useCallback((runnerId: string, stake: number) => {
    setBetSlip(prev => prev.map(b => b.runnerId === runnerId ? { ...b, stake } : b));
  }, []);

  const placeBets = useCallback(() => {
    const totalStake = betSlip.reduce((sum, b) => sum + b.stake, 0);
    if (totalStake > currentUser.balance || totalStake === 0) return;

    const newBets: Bet[] = betSlip.filter(b => b.stake > 0).map(b => ({
      id: `b${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      marketId: b.marketId,
      runnerId: b.runnerId,
      runnerName: b.runnerName,
      type: b.type,
      odds: b.odds,
      stake: b.stake,
      potentialProfit: b.type === 'back' ? parseFloat(((b.odds - 1) * b.stake).toFixed(2)) : b.stake,
      status: 'matched',
      timestamp: new Date().toISOString(),
    }));

    const newTxns: Transaction[] = newBets.map(b => ({
      id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'bet_debit' as const,
      amount: b.stake,
      description: `${b.type} bet: ${b.runnerName} @ ${b.odds}`,
      timestamp: b.timestamp,
      balanceAfter: 0,
    }));

    let bal = currentUser.balance;
    newTxns.forEach(t => { bal -= t.amount; t.balanceAfter = bal; });

    setCurrentUser(prev => ({ ...prev, balance: bal }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: bal } : u));
    setBets(prev => [...newBets, ...prev]);
    setTransactions(prev => [...newTxns, ...prev]);
    setBetSlip([]);
  }, [betSlip, currentUser]);

  const clearBetSlip = useCallback(() => setBetSlip([]), []);

  const switchUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, [users]);

  const loginUser = useCallback((username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const addPoints = useCallback((userId: string, amount: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + amount } : u));
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, balance: prev.balance + amount }));
    }
  }, [currentUser.id]);

  const removePoints = useCallback((userId: string, amount: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: Math.max(0, u.balance - amount) } : u));
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
    }
  }, [currentUser.id]);

  const changeRole = useCallback((userId: string, role: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  }, []);

  const createUser = useCallback((username: string, password: string, role: Role, parentId: string): User | null => {
    if (users.find(u => u.username === username)) return null;
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
  }, [users]);

  const getDownlineUsers = useCallback((userId: string): User[] => {
    return users.filter(u => u.parentId === userId && u.role === 'user');
  }, [users]);

  const getDownlineAdmins = useCallback((userId: string): User[] => {
    return users.filter(u => u.parentId === userId && u.role === 'admin');
  }, [users]);

  return (
    <AppContext.Provider value={{
      currentUser, users, markets, bets, transactions, betSlip,
      addToBetSlip, removeFromBetSlip, updateBetSlipStake,
      placeBets, clearBetSlip, switchUser, loginUser,
      addPoints, removePoints, changeRole,
      createUser, getDownlineUsers, getDownlineAdmins,
    }}>
      {children}
    </AppContext.Provider>
  );
};
