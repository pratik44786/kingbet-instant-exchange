export const env = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'KINGBET Exchange',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  api: {
    url: import.meta.env.VITE_API_URL || '',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  features: {
    casino: import.meta.env.VITE_ENABLE_CASINO === 'true',
    exchange: import.meta.env.VITE_ENABLE_EXCHANGE === 'true',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export const validateEnv = (): void => {
  const warnings: string[] = [];

  if (!env.app.name) {
    warnings.push('VITE_APP_NAME is not set');
  }

  if (warnings.length > 0) {
    console.warn('Environment validation warnings:', warnings);
  }
};
