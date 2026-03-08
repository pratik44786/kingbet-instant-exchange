export interface CasinoGame {
  gameId: string;
  name: string;
  provider: string;
  type: 'live' | 'table' | 'instant';
  image: string;
}

const DC_IMG = 'https://diamondcasino.neogames.cloud/assets/images/';

export const CASINO_GAMES: CasinoGame[] = [
  // Teenpatti
  { gameId: 'teen20', name: '20-20 Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen20.jpg` },
  { gameId: 'teen', name: 'Teenpatti 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen.jpg` },
  { gameId: 'teen8', name: 'Teenpatti Open', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen8.jpg` },
  { gameId: 'teen33', name: 'Instant Teenpatti 3.0', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen33.jpg` },
  { gameId: 'teen32', name: 'Instant Teenpatti 2.0', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen32.jpg` },
  { gameId: 'teenunique', name: 'Unique Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teenunique.jpg` },
  { gameId: 'teen62', name: 'V VIP Teenpatti 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen62.gif` },
  { gameId: 'teen20v1', name: '20-20 Teenpatti VIP1', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen20v1.jpg` },
  { gameId: 'teen20c', name: '20-20 Teenpatti C', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen20c.jpg` },
  { gameId: 'teen41', name: 'Queen Top Open Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen41.jpg` },
  { gameId: 'teen42', name: 'Jack Top Open Teenpatti', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}teen42.jpg` },

  // Dragon Tiger
  { gameId: 'dt20', name: '20-20 Dragon Tiger', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt20.jpg` },
  { gameId: 'dt6', name: '1 Day Dragon Tiger', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt6.jpg` },
  { gameId: 'dt202', name: '20-20 Dragon Tiger 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dt202.jpg` },
  { gameId: 'dtl20', name: '20-20 D T L', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dtl20.jpg` },

  // Baccarat
  { gameId: 'baccarat', name: 'Baccarat', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}baccarat.jpg` },
  { gameId: 'baccarat2', name: 'Baccarat 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}baccarat2.jpg` },

  // Andar Bahar
  { gameId: 'ab20', name: 'Andar Bahar', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ab20.jpg` },
  { gameId: 'abj', name: 'Andar Bahar 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}abj.jpg` },
  { gameId: 'ab4', name: 'Andar Bahar 150 Cards', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ab4.jpg` },

  // Lucky 7
  { gameId: 'lucky7', name: 'Lucky 7 - A', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky7.jpg` },
  { gameId: 'lucky7eu', name: 'Lucky 7 - B', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky7eu.jpg` },
  { gameId: 'lucky5', name: 'Lucky 6', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky5.jpg` },
  { gameId: 'lucky15', name: 'Lucky 15', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lucky15.jpg` },

  // Roulette
  { gameId: 'roulette11', name: 'Golden Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette11.jpg` },
  { gameId: 'roulette12', name: 'Beach Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette12.jpg` },
  { gameId: 'roulette13', name: 'Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}roulette13.jpg` },
  { gameId: 'ourroullete', name: 'Unique Roulette', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ourroullete.jpg` },

  // Poker
  { gameId: 'poker', name: 'Poker 1-Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker.jpg` },
  { gameId: 'poker20', name: '20-20 Poker', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker20.jpg` },
  { gameId: 'poker6', name: 'Poker 6 Players', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poker6.jpg` },

  // 32 Cards
  { gameId: 'card32', name: '32 Cards A', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}card32.jpg` },
  { gameId: 'card32eu', name: '32 Cards B', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}card32eu.jpg` },

  // Other
  { gameId: '3cardj', name: '3 Cards Judgement', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}3cardj.jpg` },
  { gameId: 'war', name: 'Casino War', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}war.jpg` },
  { gameId: 'aaa', name: 'Amar Akbar Anthony', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}aaa.jpg` },
  { gameId: 'btable', name: 'Bollywood Casino', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}btable.jpg` },
  { gameId: 'btable2', name: 'Bollywood Casino 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}btable2.jpg` },
  { gameId: 'worli', name: 'Worli Matka', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli.jpg` },
  { gameId: 'worli2', name: 'Instant Worli', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli2.jpg` },
  { gameId: 'worli3', name: 'Matka', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}worli3.gif` },
  { gameId: 'lottcard', name: 'Lottery', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}lottcard.jpg` },
  { gameId: 'sicbo', name: 'Sic Bo', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}sicbo.jpg` },
  { gameId: 'sicbo2', name: 'Sic Bo 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}sicbo2.jpg` },
  { gameId: 'ballbyball', name: 'Ball by Ball', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}ballbyball.jpg` },
  { gameId: 'superover2', name: 'Super Over 2', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}superover2.jpg` },
  { gameId: 'superover3', name: 'Mini Superover', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}superover3.jpg` },
  { gameId: 'goal', name: 'Goal', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}goal.jpg` },
  { gameId: 'mogambo', name: 'Mogambo', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}mogambo.jpg` },
  { gameId: 'dolidana', name: 'Dolidana', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}dolidana.gif` },
  { gameId: 'joker20', name: 'Teenpatti Joker 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker20.jpg` },
  { gameId: 'joker1', name: 'Unlimited Joker Oneday', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker1.jpg` },
  { gameId: 'joker120', name: 'Unlimited Joker 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}joker120.jpg` },
  { gameId: 'poison', name: 'Teenpatti Poison One Day', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poison.jpg` },
  { gameId: 'poison20', name: 'Teenpatti Poison 20-20', provider: 'DIAMOND', type: 'live', image: `${DC_IMG}poison20.jpg` },
];

export const GAME_PROVIDERS = [...new Set(CASINO_GAMES.map(g => g.provider))].sort();
export const GAME_TYPES = [...new Set(CASINO_GAMES.map(g => g.type))].sort();
