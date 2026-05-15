/**
 * Provider selector.
 *
 * Resolution order:
 *   1. localStorage `gymos_app_mode`  (runtime QA override)
 *   2. import.meta.env.VITE_APP_MODE  ('demo' | 'production')
 *   3. default → 'demo'
 *
 * Phase 0: regardless of mode we return LocalDataProvider so that
 * the current behavior is preserved exactly. Phase 4 will switch
 * the 'production' branch to SupabaseDataProvider.
 */
import { LocalDataProvider } from './LocalDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';
import type { IDataProvider } from './IDataProvider';

export type AppMode = 'demo' | 'production';

export function getAppMode(): AppMode {
  try {
    if (typeof window !== 'undefined') {
      const override = window.localStorage?.getItem('gymos_app_mode');
      if (override === 'demo' || override === 'production') return override;
    }
  } catch {
    /* localStorage unavailable */
  }
  const envMode = (import.meta.env?.VITE_APP_MODE as string | undefined)?.toLowerCase();
  if (envMode === 'production') return 'production';
  return 'demo';
}

export function setAppModeOverride(mode: AppMode | null): void {
  try {
    if (mode === null) window.localStorage.removeItem('gymos_app_mode');
    else window.localStorage.setItem('gymos_app_mode', mode);
  } catch {
    /* ignore */
  }
}

export function getProvider(): IDataProvider {
  // Phase 0: always Local. Phase 4 will flip 'production' → SupabaseDataProvider.
  // SupabaseDataProvider is referenced here only to keep the import alive
  // and prevent dead-code elimination before Phase 4.
  void SupabaseDataProvider;
  return LocalDataProvider;
}

export { LocalDataProvider, SupabaseDataProvider };
export type { IDataProvider };
