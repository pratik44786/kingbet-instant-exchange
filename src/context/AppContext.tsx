import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useMarkets, MarketData } from '@/hooks/useMarkets';
import { useBets, BetData } from '@/hooks/useBets';
import { useTransactions, TransactionData } from '@/hooks/useTransactions';
import { bettingService } from '@/services/bettingService';
import type { BetSlipItem } from '@/types/exchange';

interface AppContextType {
  currentUser: {
    id: string;
    username: string;
    role: string;
    balance: number;
    exposure: number;
    available: number;
  };
  wallet: ReturnType<typeof useWallet>;
  markets: MarketData[];
  marketsLoading: boolean;
  bets: BetData[];
  betsLoading: boolean;
  transactions: TransactionData[];
  transactionsLoading: boolean;
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  removeFromBetSlip: (runnerId: string) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => Promise<void>;
  clearBetSlip: () => void;
  logout: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const walletHook = useWallet();
  const { markets, loading: marketsLoading, refetch: refetchMarkets } = useMarkets();
  const { bets, loading: betsLoading, refetch: refetchBets } = useBets();
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  const currentUser = {
    id: authUser?.id || 'guest',
    username: authUser?.username || 'Guest',
    role: authUser?.role || 'user',
    balance: walletHook.wallet?.balance || 0,
    exposure: walletHook.wallet?.exposure || 0,
    available: walletHook.wallet?.available || 0,
  };

  const logout = useCallback(async () => {
    await authLogout();
    navigate('/login', { replace: true });
  }, [authLogout, navigate]);

  const addToBetSlip = useCallback((item: Omit<BetSlipItem, 'stake'>) => {
    setBetSlip(prev => prev.some(b => b.runnerId === item.runnerId) ? prev : [...prev, { ...item, stake: 0 }]);
  }, []);

  const removeFromBetSlip = useCallback((rid: string) => {
    setBetSlip(prev => prev.filter(b => b.runnerId !== rid));
  }, []);

  const updateBetSlipStake = useCallback((rid: string, s: number) => {
    setBetSlip(prev => prev.map(b => b.runnerId === rid ? { ...b, stake: s } : b));
  }, []);

  const placeBets = useCallback(async () => {
    const validBets = betSlip.filter(b => b.stake > 0);
    if (validBets.length === 0) return;

    for (const bet of validBets) {
      // Secondary market bets use fake runner IDs (contain '-secondary-'), pass null instead
      const isSecondary = bet.runnerId.includes('-secondary-');
      await bettingService.placeBet({
        market_id: bet.marketId,
        runner_id: isSecondary ? undefined : bet.runnerId,
        bet_type: bet.type,
        odds: bet.odds,
        stake: bet.stake,
      });
    }

    setBetSlip([]);
    walletHook.refetch();
    refetchBets();
    refetchTransactions();
  }, [betSlip, walletHook, refetchBets, refetchTransactions]);

  const clearBetSlip = useCallback(() => setBetSlip([]), []);

  const refreshData = useCallback(() => {
    walletHook.refetch();
    refetchMarkets();
    refetchBets();
    refetchTransactions();
  }, [walletHook, refetchMarkets, refetchBets, refetchTransactions]);

  return (
    <AppContext.Provider value={{
      currentUser, wallet: walletHook, markets, marketsLoading,
      bets, betsLoading, transactions, transactionsLoading,
      betSlip, addToBetSlip, removeFromBetSlip, updateBetSlipStake,
      placeBets, clearBetSlip, logout, refreshData,
    }}>
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
