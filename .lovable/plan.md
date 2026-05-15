
# GymOS → Supabase Migration Plan (Phased, Non-Breaking)

This is a planning document. **No code changes will be made until you approve a phase.** Each phase is independently shippable and reversible.

---

## Guiding Principles

- **Demo mode keeps working at every step.** localStorage + `seedDemoData` + `demoDataService` stay intact.
- Per your decision: **demo mode will eventually seed a temp Supabase namespace** (own `vendor_id`s tagged `is_demo=true`), reset-clearable.
- Production swap happens behind an `IDataProvider` adapter — UI/components do not change.
- Supabase RLS is the **real** security boundary. Frontend filters become a UX layer only.
- Each phase ends with the app fully functional in both modes.

---

## Current State (verified)

- Data layer: `src/services/dataService.ts` (829 lines) routes to either real Supabase tables (subset) or `demoDataService` based on `DemoModeContext`.
- Demo store: `src/demo/storage.ts` + `mockDb.ts` (1175 lines of seed data) + `demoStore` localStorage (`gymos_db`).
- Auth: `GymAuthContext` uses local `authService` (mobile + password against demo users). Supabase Auth exists but only for the older `Auth.tsx` flow.
- Supabase tables today: `members, payments, plans, leads, expenses, trainers, gyms, profiles, gym_settings, contact_settings, branches, gallery, reviews, testimonials, website_content, website_sections`. **Missing**: `vendors, super_owners, super_owner_vendor_access, permissions, trainer_assignments, trainer_sessions, recycle_bin, invoices, notifications, popups, youtube_*`. Existing tables also lack `vendor_id`.

---

## Phase 0 — Adapter Scaffold (no DB changes)

Create the abstraction so all later phases plug in cleanly.

- New `src/services/providers/IDataProvider.ts` — interface mirroring current `dataService` exports.
- `LocalDataProvider` — wraps current `demoDataService` + localStorage logic (zero behavior change).
- `SupabaseDataProvider` — empty stubs throwing `NotImplemented`.
- `src/services/providers/index.ts` — `getProvider()` returns Local for now; respects `APP_MODE` env + runtime override.
- `dataService.ts` becomes a thin re-export delegating to `getProvider()`.
- Add `APP_MODE` to `.env.example` (values: `demo` | `production`). Default: `demo`.

**Risk:** very low. **Validation:** all existing pages render identically.

---

## Phase 1 — Supabase Schema + RLS

Single migration creating the full multi-tenant schema. Existing tables keep working; new tables/columns are additive.

### New tables
`vendors, super_owners, super_owner_vendor_access, app_users, role_permissions, trainer_assignments, trainer_sessions, recycle_bin, invoices, notifications, popups, youtube_testimonials, youtube_shorts`.

### Add `vendor_id uuid` (+ `is_demo bool default false`, `updated_at`) to existing business tables
`members, payments, plans, leads, expenses, trainers, branches, gallery, reviews, testimonials, website_content, website_sections, gym_settings, contact_settings`.

### Roles & helper
- `app_role` enum: `super_admin | super_owner | owner | employee`.
- `user_roles(user_id, role, vendor_id)` table.
- `has_role(_uid, _role)` SECURITY DEFINER function.
- `current_vendor_id()` SECURITY DEFINER → resolves caller's vendor (owner/employee) or NULL.
- `can_access_vendor(_uid, _vendor)` → true if super_admin, owner of that vendor, employee of it, or super_owner with row in `super_owner_vendor_access`.

### RLS pattern (every business table)
```
SELECT/UPDATE/DELETE  USING  (can_access_vendor(auth.uid(), vendor_id))
INSERT                WITH CHECK (can_access_vendor(auth.uid(), vendor_id))
```
Public-readable tables (`plans, branches, reviews, testimonials, website_*, gallery`) keep their `anon SELECT` policies but scoped by `vendor_id` via a public view if needed for the landing page.

**Risk:** medium — schema only, no data migrated yet. **Validation:** Supabase linter passes; demo mode untouched (still on localStorage).

---

## Phase 2 — Seeding Script

`scripts/seedSupabase.ts` (Node, uses service role key locally only):
- Reads `mockDb.ts` + `seedDemoData.ts` exports.
- Inserts vendors → users → permissions → super_owners → mappings → members/plans/payments/etc. with proper `vendor_id` + `is_demo=true`.
- Idempotent (`ON CONFLICT DO NOTHING` on natural keys).

In-app: a "Reset demo namespace" button in the existing demo mode UI calls a new edge function `reset-demo-namespace` that wipes `is_demo=true` rows for the current demo vendor_ids and re-seeds.

**Risk:** low (script-only). **Validation:** running script populates Supabase; query counts match mock dataset.

---

## Phase 3 — Auth Migration

- Switch `GymAuthContext` to Supabase Auth (mobile-as-email pattern: `<digits>@gym.local` + password) so existing mobile-number UX is preserved.
- `handle_new_user` trigger: insert `app_users` row + default role.
- Map demo accounts on first login by calling a one-time `link-demo-user` edge function.
- Keep `loginAsDemo` working in demo mode (no Supabase round-trip).
- Protected routes already use `RequireAuth` — no changes.

**Risk:** high (auth is critical). Ship behind an `APP_MODE=production` feature flag; demo mode keeps local auth.

---

## Phase 4 — Provider Cutover (Production Mode)

Implement `SupabaseDataProvider` methods one entity group at a time, in this order:
1. Read-only: members, plans, payments (analytics depends on these).
2. Mutations: members, payments, plans CRUD.
3. Leads, expenses, trainers, trainer_assignments/sessions.
4. Website content, branding, popups, recycle_bin, notifications.

Each entity ships independently — only swap when its tests pass against a seeded Supabase.

**Risk:** spread across many small edits. **Validation:** dashboards/analytics show identical numbers vs demo mode for the same seed.

---

## Phase 5 — Cleanup, Realtime + Storage Scaffolding

- Centralized error handler (auth/permission/network) → toast + fallback UI.
- Storage abstraction `IStorageProvider` (Local URL ↔ Supabase Storage) — wired but pointing at current URLs.
- Realtime hook scaffolding (`useRealtimeTable`) — disabled by default.
- Remove duplicate localStorage writes from components that bypass `dataService`.

---

## Technical Details

### File layout (new)
```
src/services/providers/
  IDataProvider.ts
  LocalDataProvider.ts
  SupabaseDataProvider.ts
  index.ts            # getProvider() + APP_MODE switch
src/services/storage/
  IStorageProvider.ts
  LocalStorageProvider.ts
  SupabaseStorageProvider.ts
src/services/errors.ts  # central handler
scripts/
  seedSupabase.ts
supabase/functions/
  reset-demo-namespace/index.ts
  link-demo-user/index.ts
```

### Env
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_APP_MODE=demo            # demo | production
```
Plus `localStorage.gymos_app_mode` runtime override for QA.

### Demo namespace strategy (per your choice)
- Each demo vendor gets a UUID prefixed `demo-` in metadata + `is_demo=true`.
- "Load Demo Data" → calls `reset-demo-namespace` edge function (uses service role) → truncates `is_demo=true` rows for caller's super_owner-mapped demo vendors → re-seeds.
- Production data (`is_demo=false`) is never touched.
- RLS still enforces vendor isolation; demo users see only demo vendors.

### Don't-touch list
`mockDb.ts`, `seedDemoData.ts`, `seedTrainerData.ts`, `demoDataService.ts`, `demoStore`, current `DemoModeContext`, `RoleSwitcher`, `superOwnerPermissions` — all preserved.

---

## What I need from you to start

Approve **Phase 0** (adapter scaffold, zero behavior change) and I'll implement it. After Phase 0 is green, we move to Phase 1 (the schema migration) which I'll send via the migration tool for your approval before any DB change.

Reply "go phase 0" to proceed, or tell me what to adjust.
