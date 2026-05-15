/**
 * SupabaseDataProvider — stub for Phase 4 cutover.
 * Every method throws NotImplemented until the corresponding entity
 * is migrated. Do not wire this up yet; getProvider() still returns
 * LocalDataProvider in all modes during Phase 0.
 */
import type { IDataProvider } from './IDataProvider';
import { LocalDataProvider } from './LocalDataProvider';

const notImplemented = (name: string) => {
  return (..._args: unknown[]): never => {
    throw new Error(
      `[SupabaseDataProvider] '${name}' not implemented yet. ` +
        `Falling back to LocalDataProvider should be handled by getProvider().`
    );
  };
};

// Build a Proxy that throws for every key access. We intentionally do
// NOT enumerate every dataService function here — the interface is the
// source of truth, and Phase 4 will replace this file entirely.
export const SupabaseDataProvider: IDataProvider = new Proxy(
  {} as IDataProvider,
  {
    get(_target, prop: string) {
      // Allow Symbol/internal lookups to fall through silently.
      if (typeof prop !== 'string') return undefined;
      // During Phase 0 we mirror Local so accidental imports do not break the app.
      const local = (LocalDataProvider as unknown as Record<string, unknown>)[prop];
      if (typeof local === 'function') return local;
      return notImplemented(prop);
    },
  }
);
