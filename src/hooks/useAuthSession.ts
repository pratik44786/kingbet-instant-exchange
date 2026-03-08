import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Singleton cache for auth.getUser() — avoids redundant network calls
 * across multiple hooks that all need the current user id.
 */
let cachedUserId: string | null = null;
let cachePromise: Promise<string | null> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30s

export function getCachedUserId(): Promise<string | null> {
  const now = Date.now();
  if (cachedUserId && now - cacheTimestamp < CACHE_TTL) {
    return Promise.resolve(cachedUserId);
  }
  if (cachePromise) return cachePromise;

  cachePromise = supabase.auth.getUser().then(({ data: { user } }) => {
    cachedUserId = user?.id ?? null;
    cacheTimestamp = Date.now();
    cachePromise = null;
    return cachedUserId;
  }).catch(() => {
    cachePromise = null;
    return null;
  });

  return cachePromise;
}

export function clearCachedUserId() {
  cachedUserId = null;
  cacheTimestamp = 0;
  cachePromise = null;
}
