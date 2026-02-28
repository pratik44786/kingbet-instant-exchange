export type Role = 'user' | 'admin' | 'masteradmin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  role: Role;
  balance: number;
}

export interface Runner {
  id: string;
  name: string;
  backOdds: [number, number, number]; // best, 2nd, 3rd
  layOdds: [number, number, number];
  backSizes: [number, number, number];
  laySizes: [number, number, number];
}

export interface Market {
  id: string;
  event: string;
  competition: string;
  sport: 'cricket' | 'football' | 'tennis';
  status: 'open' | 'suspended' | 'closed';
  startTime: string;
  runners: Runner[];
}

export interface Bet {
  id: string;
  marketId: string;
  runnerId: string;
  runnerName: string;
  type: 'back' | 'lay';
  odds: number;
  stake: number;
  potentialProfit: number;
  status: 'pending' | 'matched' | 'settled' | 'void';
  timestamp: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'bet_debit' | 'bet_win';
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface BetSlipItem {
  marketId: string;
  runnerId: string;
  runnerName: string;
  eventName: string;
  type: 'back' | 'lay';
  odds: number;
  stake: number;
}
