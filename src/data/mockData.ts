import { Market, User, Bet, Transaction } from '@/types/exchange';

export const mockUsers: User[] = [
  { id: '1', username: 'superadmin', role: 'superadmin', balance: 1000000 },
  { id: '2', username: 'admin1', role: 'admin', balance: 50000 },
  { id: '3', username: 'player1', role: 'user', balance: 5000 },
  { id: '4', username: 'player2', role: 'user', balance: 12000 },
  { id: '5', username: 'player3', role: 'user', balance: 800 },
];

export const mockMarkets: Market[] = [
  {
    id: 'm1',
    event: 'India vs Australia',
    competition: 'ICC World Cup 2026',
    sport: 'cricket',
    status: 'open',
    startTime: '2026-03-01T10:00:00Z',
    runners: [
      {
        id: 'r1', name: 'India',
        backOdds: [1.98, 1.97, 1.96], layOdds: [2.00, 2.02, 2.04],
        backSizes: [15000, 8000, 22000], laySizes: [12000, 9500, 18000],
      },
      {
        id: 'r2', name: 'Australia',
        backOdds: [2.10, 2.08, 2.06], layOdds: [2.12, 2.14, 2.16],
        backSizes: [10000, 7500, 14000], laySizes: [11000, 6000, 16000],
      },
    ],
  },
  {
    id: 'm2',
    event: 'England vs South Africa',
    competition: 'ICC World Cup 2026',
    sport: 'cricket',
    status: 'open',
    startTime: '2026-03-01T14:00:00Z',
    runners: [
      {
        id: 'r3', name: 'England',
        backOdds: [1.75, 1.74, 1.72], layOdds: [1.77, 1.79, 1.80],
        backSizes: [20000, 12000, 30000], laySizes: [18000, 11000, 25000],
      },
      {
        id: 'r4', name: 'South Africa',
        backOdds: [2.30, 2.28, 2.26], layOdds: [2.32, 2.34, 2.38],
        backSizes: [8000, 5000, 11000], laySizes: [7000, 4500, 9000],
      },
    ],
  },
  {
    id: 'm3',
    event: 'Manchester United vs Liverpool',
    competition: 'Premier League',
    sport: 'football',
    status: 'open',
    startTime: '2026-03-02T15:00:00Z',
    runners: [
      {
        id: 'r5', name: 'Man United',
        backOdds: [2.50, 2.48, 2.46], layOdds: [2.52, 2.54, 2.58],
        backSizes: [25000, 18000, 35000], laySizes: [22000, 15000, 30000],
      },
      {
        id: 'r6', name: 'Draw',
        backOdds: [3.40, 3.38, 3.35], layOdds: [3.45, 3.48, 3.50],
        backSizes: [6000, 4000, 8000], laySizes: [5500, 3500, 7000],
      },
      {
        id: 'r7', name: 'Liverpool',
        backOdds: [2.80, 2.78, 2.76], layOdds: [2.82, 2.86, 2.90],
        backSizes: [14000, 10000, 20000], laySizes: [12000, 8500, 17000],
      },
    ],
  },
  {
    id: 'm4',
    event: 'Real Madrid vs Barcelona',
    competition: 'La Liga',
    sport: 'football',
    status: 'open',
    startTime: '2026-03-03T20:00:00Z',
    runners: [
      {
        id: 'r8', name: 'Real Madrid',
        backOdds: [2.20, 2.18, 2.16], layOdds: [2.22, 2.24, 2.26],
        backSizes: [30000, 22000, 40000], laySizes: [28000, 20000, 35000],
      },
      {
        id: 'r9', name: 'Draw',
        backOdds: [3.60, 3.55, 3.50], layOdds: [3.65, 3.70, 3.75],
        backSizes: [5000, 3000, 7000], laySizes: [4500, 2800, 6000],
      },
      {
        id: 'r10', name: 'Barcelona',
        backOdds: [3.10, 3.08, 3.05], layOdds: [3.15, 3.18, 3.20],
        backSizes: [12000, 8000, 16000], laySizes: [10000, 7000, 14000],
      },
    ],
  },
];

export const mockBets: Bet[] = [
  {
    id: 'b1', marketId: 'm1', runnerId: 'r1', runnerName: 'India',
    type: 'back', odds: 1.98, stake: 500, potentialProfit: 490,
    status: 'matched', timestamp: '2026-02-28T08:30:00Z',
  },
  {
    id: 'b2', marketId: 'm3', runnerId: 'r7', runnerName: 'Liverpool',
    type: 'lay', odds: 2.82, stake: 300, potentialProfit: 300,
    status: 'pending', timestamp: '2026-02-28T09:15:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'credit', amount: 10000, description: 'Points added by Admin', timestamp: '2026-02-27T10:00:00Z', balanceAfter: 10000 },
  { id: 't2', type: 'bet_debit', amount: 500, description: 'Back bet: India @ 1.98', timestamp: '2026-02-28T08:30:00Z', balanceAfter: 9500 },
  { id: 't3', type: 'bet_debit', amount: 300, description: 'Lay bet: Liverpool @ 2.82', timestamp: '2026-02-28T09:15:00Z', balanceAfter: 9200 },
];
