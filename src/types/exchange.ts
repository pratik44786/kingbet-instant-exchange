export type Role = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  balance: number;
  parentId: string | null;
  createdAt: string;
}

export interface Runner {
  id: string;
  name: string;
  backOdds: [number, number, number];
  layOdds: [number, number, number];
  backSizes: [number, number, number];
  laySizes: [number, number, number];
}

export interface FancyOdd {
  id: string;
  label: string;
  yesValue: number;
  noValue: number;
  yesOdds: number;
  noOdds: number;
}

export interface SessionOdd {
  id: string;
  label: string;
  overValue: number;
  underValue: number;
  overOdds: number;
  underOdds: number;
}

export interface Market {
  id: string;
  event: string;
  competition: string;
  sport: 'cricket' | 'football' | 'tennis';
  status: 'open' | 'suspended' | 'closed';
  startTime: string;
  runners: Runner[];
  fancyOdds?: FancyOdd[];
  sessionOdds?: SessionOdd[];
}

export interface Bet {
  id: string;
  marketId: string;
  runnerId: string;
  runnerName: string;
  type: 'back' | 'lay' | 'fancy_yes' | 'fancy_no' | 'session_over' | 'session_under';
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
  type: 'back' | 'lay' | 'fancy_yes' | 'fancy_no' | 'session_over' | 'session_under';
  odds: number;
  stake: number;
}
