export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EXCHANGE: '/exchange',
  CASINO: '/casino',
  AVIATOR: '/casino/aviator',
  PLINKO: '/casino/plinko',
  CRASH: '/casino/crash',
  DICE: '/casino/dice',
  MINES: '/casino/mines',
  WALLET: '/wallet',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  SUPER_ADMIN: '/superadmin',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_USER: 'authUser',
  USER_ID_LOGIN: 'userIdLogin',
} as const;

export const GAME_SETTINGS = {
  AVIATOR: {
    MIN_STAKE: 10,
    MAX_STAKE: 100000,
    UPDATE_INTERVAL: 50,
    AUTO_RESTART_DELAY: 3000,
    WAITING_DELAY: 2000,
  },
  PLINKO: {
    MIN_STAKE: 10,
    MAX_STAKE: 100000,
    DROP_DURATION: 1500,
  },
  CRASH: {
    MIN_STAKE: 10,
    MAX_STAKE: 100000,
    UPDATE_INTERVAL: 50,
    AUTO_RESTART_DELAY: 3000,
    WAITING_DELAY: 2000,
  },
  DICE: {
    MIN_STAKE: 10,
    MAX_STAKE: 100000,
    MIN_TARGET: 5,
    MAX_TARGET: 95,
    ROLL_DURATION: 1000,
  },
  MINES: {
    MIN_STAKE: 10,
    MAX_STAKE: 100000,
    GRID_SIZE: 25,
    MINE_COUNT: 5,
    MULTIPLIER_INCREMENT: 0.25,
  },
} as const;

export const EXCHANGE_SETTINGS = {
  PAGE_SIZE: 20,
  ODDS_UPDATE_INTERVAL: 2000,
  MIN_STAKE: 10,
  MAX_STAKE: 1000000,
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  BET_DEBIT: 'bet_debit',
  BET_WIN: 'bet_win',
} as const;

export const BET_TYPES = {
  BACK: 'back',
  LAY: 'lay',
  FANCY_YES: 'fancy_yes',
  FANCY_NO: 'fancy_no',
  SESSION_OVER: 'session_over',
  SESSION_UNDER: 'session_under',
} as const;

export const BET_STATUS = {
  PENDING: 'pending',
  MATCHED: 'matched',
  SETTLED: 'settled',
  VOID: 'void',
} as const;

export const SPORTS = {
  CRICKET: 'cricket',
  FOOTBALL: 'football',
  TENNIS: 'tennis',
} as const;

export const MARKET_STATUS = {
  OPEN: 'open',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
} as const;
