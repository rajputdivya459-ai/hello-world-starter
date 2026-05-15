/**
 * Phase 0: Data provider abstraction.
 *
 * The current `src/services/dataService.ts` already routes between local
 * mock storage and (future) Supabase based on demo-mode. This interface
 * formalizes that boundary so we can swap implementations per-entity
 * during the migration without changing any UI/component code.
 *
 * For now `IDataProvider` is intentionally a structural alias of the
 * current dataService module shape — `LocalDataProvider` simply re-exports
 * it. Future phases will add a `SupabaseDataProvider` implementation
 * one entity at a time.
 */
import type * as DataService from '@/services/dataService';

export type IDataProvider = typeof DataService;
