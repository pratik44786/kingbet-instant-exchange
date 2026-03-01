export const validation = {
  isValidUsername: (username: string): boolean => {
    return username.trim().length >= 3 && username.trim().length <= 20;
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  isValidStake: (stake: number, balance: number): boolean => {
    return stake > 0 && stake <= balance && Number.isFinite(stake);
  },

  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  isValidNumber: (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },
};
