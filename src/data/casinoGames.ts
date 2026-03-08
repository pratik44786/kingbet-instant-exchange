export interface CasinoGame {
  gameId: string;
  name: string;
  provider: string;
  type: 'live' | 'slots' | 'table' | 'crash' | 'instant';
  image: string;
  source: 'spribe' | 'diamond'; // Which API to use
}

// Diamond Casino base image URL
const DC_IMG = 'https://diamondcasino.neogames.cloud/assets/images/';

export const CASINO_GAMES: CasinoGame[] = [
  // ── SPRIBE Games (via BetNex API) ──
  { gameId: 'a04d1f3eb8ccec8a4823bdf18e3f0e84', name: 'Aviator', provider: 'SPRIBE', type: 'crash', image: 'https://cdn.betnex.co/images/spribe/0.png', source: 'spribe' },
  { gameId: '8a87aae7a3624d284306e9c6fe1b3e9c', name: 'Dice', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/1.png', source: 'spribe' },
  { gameId: 'c68a515f0b3b10eec96cf6d33299f4e2', name: 'Goal', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/2.png', source: 'spribe' },
  { gameId: 'a669c993b0e1f1b7da100fcf95516bdf', name: 'Hi Lo', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/3.png', source: 'spribe' },
  { gameId: 'b31720b3cd65d917a1a96ef61a72b672', name: 'Hotline', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/4.png', source: 'spribe' },
  { gameId: 'c311eb4bbba03b105d150504931f2479', name: 'Keno', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/5.png', source: 'spribe' },
  { gameId: '5c4a12fb0a9b296d9b0d5f9e1cd41d65', name: 'Mines', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/6.png', source: 'spribe' },
  { gameId: '9dc7ac6155c5a19c1cc204853e426367', name: 'Mini Roulette', provider: 'SPRIBE', type: 'table', image: 'https://cdn.betnex.co/images/spribe/7.png', source: 'spribe' },
  { gameId: '6ab7a4fe5161936012d6b06143918223', name: 'Plinko', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/8.png', source: 'spribe' },
  { gameId: 'de88f202c5a8beeaccabbd944f8acfbf', name: 'Balloon', provider: 'SPRIBE', type: 'crash', image: 'https://cdn.betnex.co/images/spribe/9.png', source: 'spribe' },
  { gameId: '7a762edbe411ebc9be416870a734bd03', name: 'Keno 80', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/10.png', source: 'spribe' },
  { gameId: 'ad5973a7625b5d18257e64340fe22ca1', name: 'Trader', provider: 'SPRIBE', type: 'instant', image: 'https://cdn.betnex.co/images/spribe/11.png', source: 'spribe' },
  { gameId: '874c49d5d915de9b82f66088f9794789', name: 'Roulette Arabic B', provider: 'CREEDROOMZ', type: 'live', image: 'https://cdn.betnex.co/images/spribe/7.png', source: 'spribe' },

  // ── Diamond Casino Live Tables ──
  // Teenpatti
  { gameId: 'teen20', name: '20-20 Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen20.jpg`, source: 'diamond' },
  { gameId: 'teen', name: 'Teenpatti 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen.jpg`, source: 'diamond' },
  { gameId: 'teen8', name: 'Teenpatti Open', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen8.jpg`, source: 'diamond' },
  { gameId: 'teen33', name: 'Instant Teenpatti 3.0', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen33.jpg`, source: 'diamond' },
  { gameId: 'teen32', name: 'Instant Teenpatti 2.0', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen32.jpg`, source: 'diamond' },
  { gameId: 'teenunique', name: 'Unique Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teenunique.jpg`, source: 'diamond' },
  { gameId: 'teen62', name: 'V VIP Teenpatti 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen62.gif`, source: 'diamond' },
  { gameId: 'teen20v1', name: '20-20 Teenpatti VIP1', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen20v1.jpg`, source: 'diamond' },

  // Dragon Tiger
  { gameId: 'dt20', name: '20-20 Dragon Tiger', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt20.jpg`, source: 'diamond' },
  { gameId: 'dt6', name: '1 Day Dragon Tiger', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt6.jpg`, source: 'diamond' },
  { gameId: 'dt202', name: '20-20 Dragon Tiger 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt202.jpg`, source: 'diamond' },
  { gameId: 'dtl20', name: '20-20 D T L', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dtl20.jpg`, source: 'diamond' },

  // Baccarat
  { gameId: 'baccarat', name: 'Baccarat', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}baccarat.jpg`, source: 'diamond' },
  { gameId: 'baccarat2', name: 'Baccarat 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}baccarat2.jpg`, source: 'diamond' },

  // Andar Bahar
  { gameId: 'ab20', name: 'Andar Bahar', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ab20.jpg`, source: 'diamond' },
  { gameId: 'abj', name: 'Andar Bahar 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}abj.jpg`, source: 'diamond' },
  { gameId: 'ab4', name: 'Andar Bahar 150 Cards', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ab4.jpg`, source: 'diamond' },

  // Lucky 7
  { gameId: 'lucky7', name: 'Lucky 7 - A', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky7.jpg`, source: 'diamond' },
  { gameId: 'lucky7eu', name: 'Lucky 7 - B', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky7eu.jpg`, source: 'diamond' },
  { gameId: 'lucky5', name: 'Lucky 6', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky5.jpg`, source: 'diamond' },
  { gameId: 'lucky15', name: 'Lucky 15', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky15.jpg`, source: 'diamond' },

  // Roulette
  { gameId: 'roulette11', name: 'Golden Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette11.jpg`, source: 'diamond' },
  { gameId: 'roulette12', name: 'Beach Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette12.jpg`, source: 'diamond' },
  { gameId: 'roulette13', name: 'Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette13.jpg`, source: 'diamond' },
  { gameId: 'ourroullete', name: 'Unique Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ourroullete.jpg`, source: 'diamond' },

  // Poker
  { gameId: 'poker', name: 'Poker 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker.jpg`, source: 'diamond' },
  { gameId: 'poker20', name: '20-20 Poker', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker20.jpg`, source: 'diamond' },
  { gameId: 'poker6', name: 'Poker 6 Players', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker6.jpg`, source: 'diamond' },

  // 32 Cards
  { gameId: 'card32', name: '32 Cards A', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}card32.jpg`, source: 'diamond' },
  { gameId: 'card32eu', name: '32 Cards B', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}card32eu.jpg`, source: 'diamond' },

  // Other
  { gameId: '3cardj', name: '3 Cards Judgement', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}3cardj.jpg`, source: 'diamond' },
  { gameId: 'war', name: 'Casino War', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}war.jpg`, source: 'diamond' },
  { gameId: 'aaa', name: 'Amar Akbar Anthony', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}aaa.jpg`, source: 'diamond' },
  { gameId: 'btable', name: 'Bollywood Casino', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}btable.jpg`, source: 'diamond' },
  { gameId: 'btable2', name: 'Bollywood Casino 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}btable2.jpg`, source: 'diamond' },
  { gameId: 'worli', name: 'Worli Matka', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli.jpg`, source: 'diamond' },
  { gameId: 'worli2', name: 'Instant Worli', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli2.jpg`, source: 'diamond' },
  { gameId: 'worli3', name: 'Matka', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli3.gif`, source: 'diamond' },
  { gameId: 'lottcard', name: 'Lottery', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lottcard.jpg`, source: 'diamond' },
  { gameId: 'sicbo', name: 'Sic Bo', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}sicbo.jpg`, source: 'diamond' },
  { gameId: 'sicbo2', name: 'Sic Bo 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}sicbo2.jpg`, source: 'diamond' },
  { gameId: 'ballbyball', name: 'Ball by Ball', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ballbyball.jpg`, source: 'diamond' },
  { gameId: 'superover2', name: 'Super Over 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}superover2.jpg`, source: 'diamond' },
  { gameId: 'superover3', name: 'Mini Superover', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}superover3.jpg`, source: 'diamond' },
  { gameId: 'goal', name: 'Goal', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}goal.jpg`, source: 'diamond' },
  { gameId: 'mogambo', name: 'Mogambo', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}mogambo.jpg`, source: 'diamond' },
  { gameId: 'dolidana', name: 'Dolidana', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dolidana.gif`, source: 'diamond' },

  // Joker Teenpatti
  { gameId: 'joker20', name: 'Teenpatti Joker 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker20.jpg`, source: 'diamond' },
  { gameId: 'joker1', name: 'Unlimited Joker Oneday', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker1.jpg`, source: 'diamond' },
  { gameId: 'joker120', name: 'Unlimited Joker 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker120.jpg`, source: 'diamond' },

  // Poison Teenpatti
  { gameId: 'poison', name: 'Teenpatti Poison One Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poison.jpg`, source: 'diamond' },
  { gameId: 'poison20', name: 'Teenpatti Poison 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poison20.jpg`, source: 'diamond' },
];

export const GAME_PROVIDERS = [...new Set(CASINO_GAMES.map(g => g.provider))].sort();
export const GAME_TYPES = [...new Set(CASINO_GAMES.map(g => g.type))].sort();
