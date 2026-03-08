import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.kingbet',
  appName: 'KingBet Exchange',
  webDir: 'dist',
  server: {
    url: 'https://6abd68a6-7a24-4c26-980e-2755462eea4a.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
