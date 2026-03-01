import { Market, User, Bet, Transaction, FancyOdd, SessionOdd } from '@/types/exchange';

export const mockUsers: User[] = [
  { id: '1', username: 'superadmin', password: 'super123', role: 'superadmin', balance: 1000000, parentId: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', username: 'admin1', password: 'admin123', role: 'admin', balance: 50000, parentId: '1', createdAt: '2026-01-15T00:00:00Z' },
  { id: '3', username: 'admin2', password: 'admin123', role: 'admin', balance: 30000, parentId: '1', createdAt: '2026-02-01T00:00:00Z' },
  { id: '4', username: 'player1', password: 'user123', role: 'user', balance: 5000, parentId: '2', createdAt: '2026-02-10T00:00:00Z' },
  { id: '5', username: 'player2', password: 'user123', role: 'user', balance: 12000, parentId: '2', createdAt: '2026-02-12T00:00:00Z' },
  { id: '6', username: 'player3', password: 'user123', role: 'user', balance: 800, parentId: '3', createdAt: '2026-02-15T00:00:00Z' },
  { id: '7', username: 'player4', password: 'user123', role: 'user', balance: 3500, parentId: '3', createdAt: '2026-02-20T00:00:00Z' },
];

const cricketTeams = [
  'India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan',
  'Sri Lanka', 'Bangladesh', 'West Indies', 'Afghanistan', 'Zimbabwe', 'Ireland',
  'Netherlands', 'Scotland', 'Nepal', 'UAE', 'Oman', 'Namibia',
];
const cricketComps = ['ICC World Cup 2026', 'IPL 2026', 'Ashes 2026', 'Asia Cup 2026', 'T20 Blast', 'Big Bash League', 'CPL 2026', 'PSL 2026'];

const footballTeams = [
  'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester City', 'Tottenham',
  'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan',
  'Inter Milan', 'Dortmund', 'Atletico Madrid', 'Napoli', 'Ajax', 'Benfica',
  'Porto', 'Sevilla', 'Roma', 'Lazio', 'Leicester', 'Everton',
];
const footballComps = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League', 'FA Cup'];

const tennisPlayers = [
  'Djokovic', 'Alcaraz', 'Sinner', 'Medvedev', 'Rublev', 'Zverev',
  'Ruud', 'Tsitsipas', 'Fritz', 'Tiafoe', 'Rune', 'Shelton',
];
const tennisComps = ['Australian Open', 'French Open', 'Wimbledon', 'US Open', 'ATP Finals', 'Indian Wells'];

function randomOdds(base: number): number {
  return parseFloat((base + (Math.random() - 0.5) * 0.5).toFixed(2));
}

function randomSize(): number {
  return Math.floor(5000 + Math.random() * 40000);
}

function makeRunner(id: string, name: string, baseOdds: number) {
  const bo = randomOdds(baseOdds);
  const lo = parseFloat((bo + 0.02 + Math.random() * 0.06).toFixed(2));
  return {
    id,
    name,
    backOdds: [bo, parseFloat((bo - 0.01).toFixed(2)), parseFloat((bo - 0.02).toFixed(2))] as [number, number, number],
    layOdds: [lo, parseFloat((lo + 0.02).toFixed(2)), parseFloat((lo + 0.04).toFixed(2))] as [number, number, number],
    backSizes: [randomSize(), randomSize(), randomSize()] as [number, number, number],
    laySizes: [randomSize(), randomSize(), randomSize()] as [number, number, number],
  };
}

function makeFancyOdds(matchId: string): FancyOdd[] {
  const overs = [6, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  return overs.slice(0, 4 + Math.floor(Math.random() * 4)).map((over, i) => ({
    id: `fancy-${matchId}-${i}`,
    label: `Over ${over} Runs`,
    yesValue: Math.floor(30 + over * 1.2 + Math.random() * 15),
    noValue: Math.floor(28 + over * 1.2 + Math.random() * 12),
    yesOdds: parseFloat((90 + Math.random() * 10).toFixed(0)),
    noOdds: parseFloat((90 + Math.random() * 10).toFixed(0)),
  }));
}

function makeSessionOdds(matchId: string, teams: string[]): SessionOdd[] {
  return teams.flatMap((team, ti) => [
    {
      id: `session-${matchId}-${ti}-1`,
      label: `${team} 1st Innings Runs`,
      overValue: Math.floor(140 + Math.random() * 80),
      underValue: Math.floor(130 + Math.random() * 80),
      overOdds: parseFloat((85 + Math.random() * 15).toFixed(0)),
      underOdds: parseFloat((85 + Math.random() * 15).toFixed(0)),
    },
    {
      id: `session-${matchId}-${ti}-2`,
      label: `${team} Total Boundaries`,
      overValue: Math.floor(15 + Math.random() * 10),
      underValue: Math.floor(13 + Math.random() * 10),
      overOdds: parseFloat((88 + Math.random() * 12).toFixed(0)),
      underOdds: parseFloat((88 + Math.random() * 12).toFixed(0)),
    },
  ]);
}

function generateMarkets(): Market[] {
  const markets: Market[] = [];
  let id = 1;
  let rId = 1;

  // Cricket markets (~300)
  for (let i = 0; i < cricketTeams.length; i++) {
    for (let j = i + 1; j < cricketTeams.length; j++) {
      if (markets.filter(m => m.sport === 'cricket').length >= 300) break;
      const comp = cricketComps[Math.floor(Math.random() * cricketComps.length)];
      const hours = Math.floor(Math.random() * 72);
      const mId = `m${id++}`;
      const teamA = cricketTeams[i];
      const teamB = cricketTeams[j];
      markets.push({
        id: mId,
        event: `${teamA} vs ${teamB}`,
        competition: comp,
        sport: 'cricket',
        status: 'open',
        startTime: new Date(Date.now() + hours * 3600000).toISOString(),
        runners: [
          makeRunner(`r${rId++}`, teamA, 1.8 + Math.random() * 0.6),
          makeRunner(`r${rId++}`, teamB, 1.8 + Math.random() * 0.6),
        ],
        fancyOdds: makeFancyOdds(mId),
        sessionOdds: makeSessionOdds(mId, [teamA, teamB]),
      });
    }
  }

  // Football markets (~400) with Draw
  for (let i = 0; i < footballTeams.length; i++) {
    for (let j = i + 1; j < footballTeams.length; j++) {
      if (markets.filter(m => m.sport === 'football').length >= 400) break;
      const comp = footballComps[Math.floor(Math.random() * footballComps.length)];
      const hours = Math.floor(Math.random() * 72);
      markets.push({
        id: `m${id++}`,
        event: `${footballTeams[i]} vs ${footballTeams[j]}`,
        competition: comp,
        sport: 'football',
        status: 'open',
        startTime: new Date(Date.now() + hours * 3600000).toISOString(),
        runners: [
          makeRunner(`r${rId++}`, footballTeams[i], 2.0 + Math.random() * 1.0),
          makeRunner(`r${rId++}`, 'Draw', 3.0 + Math.random() * 0.8),
          makeRunner(`r${rId++}`, footballTeams[j], 2.0 + Math.random() * 1.0),
        ],
      });
    }
  }

  // Tennis markets (~300)
  for (let i = 0; i < tennisPlayers.length; i++) {
    for (let j = i + 1; j < tennisPlayers.length; j++) {
      for (let k = 0; k < 5 && markets.filter(m => m.sport === 'tennis').length < 300; k++) {
        const comp = tennisComps[Math.floor(Math.random() * tennisComps.length)];
        const hours = Math.floor(Math.random() * 72);
        markets.push({
          id: `m${id++}`,
          event: `${tennisPlayers[i]} vs ${tennisPlayers[j]}`,
          competition: comp,
          sport: 'tennis',
          status: 'open',
          startTime: new Date(Date.now() + hours * 3600000).toISOString(),
          runners: [
            makeRunner(`r${rId++}`, tennisPlayers[i], 1.5 + Math.random() * 1.0),
            makeRunner(`r${rId++}`, tennisPlayers[j], 1.5 + Math.random() * 1.0),
          ],
        });
      }
    }
  }

  return markets;
}

export const mockMarkets: Market[] = generateMarkets();

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
