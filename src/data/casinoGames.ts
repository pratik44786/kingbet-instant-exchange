export interface CasinoGame {
  gameId: string;
  name: string;
  provider: string;
  type: 'live' | 'slots' | 'table' | 'crash' | 'fish';
  image: string;
}

// Popular games from Evolution, Jili, Pragmatic, and other providers
export const CASINO_GAMES: CasinoGame[] = [
  // Evolution Live
  { gameId: '874c49d5d915de9b82f66088f9794789', name: 'Roulette Arabic B', provider: 'CREEDROOMZ', type: 'live', image: 'https://img.freepik.com/free-vector/realistic-casino-roulette_52683-108.jpg' },
  { gameId: 'evolution_crazy_time', name: 'Crazy Time', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/wheel-fortune_1284-3036.jpg' },
  { gameId: 'evolution_lightning_roulette', name: 'Lightning Roulette', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/realistic-casino-roulette_52683-108.jpg' },
  { gameId: 'evolution_blackjack', name: 'Blackjack Live', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/casino-chips-aces-playing-cards_1441-510.jpg' },
  { gameId: 'evolution_baccarat', name: 'Baccarat Live', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/casino-chips-aces-playing-cards_1441-510.jpg' },
  { gameId: 'evolution_dragon_tiger', name: 'Dragon Tiger', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/playing-cards-chips_1441-69.jpg' },
  { gameId: 'evolution_teen_patti', name: 'Teen Patti Live', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/playing-cards-chips_1441-69.jpg' },
  { gameId: 'evolution_andar_bahar', name: 'Andar Bahar Live', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/playing-cards-chips_1441-69.jpg' },
  { gameId: 'evolution_monopoly', name: 'Monopoly Live', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/wheel-fortune_1284-3036.jpg' },
  { gameId: 'evolution_deal_or_no_deal', name: 'Deal or No Deal', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/wheel-fortune_1284-3036.jpg' },
  { gameId: 'evolution_funky_time', name: 'Funky Time', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/wheel-fortune_1284-3036.jpg' },
  { gameId: 'evolution_mega_ball', name: 'Mega Ball', provider: 'Evolution', type: 'live', image: 'https://img.freepik.com/free-vector/lottery-balls_1284-5765.jpg' },

  // Jili Slots
  { gameId: 'jili_super_ace', name: 'Super Ace', provider: 'Jili', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'jili_fortune_gems', name: 'Fortune Gems', provider: 'Jili', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'jili_golden_empire', name: 'Golden Empire', provider: 'Jili', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'jili_money_coming', name: 'Money Coming', provider: 'Jili', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'jili_boxing_king', name: 'Boxing King', provider: 'Jili', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },

  // Pragmatic Play
  { gameId: 'pp_sweet_bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'pp_gates_of_olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'pp_big_bass_bonanza', name: 'Big Bass Bonanza', provider: 'Pragmatic Play', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },
  { gameId: 'pp_dog_house', name: 'The Dog House', provider: 'Pragmatic Play', type: 'slots', image: 'https://img.freepik.com/free-vector/slot-machine-realistic_1284-8955.jpg' },

  // Table Games
  { gameId: 'table_roulette_auto', name: 'Auto Roulette', provider: 'Ezugi', type: 'table', image: 'https://img.freepik.com/free-vector/realistic-casino-roulette_52683-108.jpg' },
  { gameId: 'table_speed_baccarat', name: 'Speed Baccarat', provider: 'Ezugi', type: 'table', image: 'https://img.freepik.com/free-vector/casino-chips-aces-playing-cards_1441-510.jpg' },
  { gameId: 'table_sic_bo', name: 'Sic Bo', provider: 'Ezugi', type: 'table', image: 'https://img.freepik.com/free-vector/playing-cards-chips_1441-69.jpg' },
];

export const GAME_PROVIDERS = [...new Set(CASINO_GAMES.map(g => g.provider))].sort();
export const GAME_TYPES = [...new Set(CASINO_GAMES.map(g => g.type))].sort();
