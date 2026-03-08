export interface CasinoGame {
  gameId: string;
  name: string;
  provider: string;
  type: 'live' | 'slots' | 'table' | 'crash' | 'instant';
  image: string;
}

export const CASINO_GAMES: CasinoGame[] = [
  // SPRIBE Games
  { gameId: 'a04d1f3eb8ccec8a4823bdf18e3f0e84', name: 'Aviator', provider: 'SPRIBE', type: 'crash', image: 'https://cdn.betnex.co/images/spribe/0.png' },
  { gameId: '8a87aae7a3624d284306e9c6fe1b3e9c', name: 'Dice', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/1.png' },
  { gameId: 'c68a515f0b3b10eec96cf6d33299f4e2', name: 'Goal', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/2.png' },
  { gameId: 'a669c993b0e1f1b7da100fcf95516bdf', name: 'Hi Lo', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/3.png' },
  { gameId: 'b31720b3cd65d917a1a96ef61a72b672', name: 'Hotline', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/4.png' },
  { gameId: 'c311eb4bbba03b105d150504931f2479', name: 'Keno', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/5.png' },
  { gameId: '5c4a12fb0a9b296d9b0d5f9e1cd41d65', name: 'Mines', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/6.png' },
  { gameId: '9dc7ac6155c5a19c1cc204853e426367', name: 'Mini Roulette', provider: 'SPRIBE', type: 'table', image: 'https://cdn.betnex.co/images/spribe/7.png' },
  { gameId: '6ab7a4fe5161936012d6b06143918223', name: 'Plinko', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/8.png' },
  { gameId: 'de88f202c5a8beeaccabbd944f8acfbf', name: 'Balloon', provider: 'SPRIBE', type: 'crash', image: 'https://cdn.betnex.co/images/spribe/9.png' },
  { gameId: '7a762edbe411ebc9be416870a734bd03', name: 'Keno 80', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/10.png' },
  { gameId: 'ad5973a7625b5d18257e64340fe22ca1', name: 'Trader', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/11.png' },

  // CREEDROOMZ Live
  { gameId: '874c49d5d915de9b82f66088f9794789', name: 'Roulette Arabic B', provider: 'CREEDROOMZ', type: 'live', image: 'https://img.freepik.com/free-vector/realistic-casino-roulette_52683-108.jpg' },
];

export const GAME_PROVIDERS = [...new Set(CASINO_GAMES.map(g => g.provider))].sort();
export const GAME_TYPES = [...new Set(CASINO_GAMES.map(g => g.type))].sort();
