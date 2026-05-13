# Phase 1 — Architecture & Data-Consistency Audit

## Summary

| Area | Status | Notes |
|---|---|---|
| Entity relations (vendor / member / payment / trainer) | ✅ Validated | New `auditDemoIntegrity()` runs on demo load; orphans/dupes log to console in dev. |
| RBAC permission gates (demoDataService) | 🛠 Fixed | 5 real bugs blocking valid users; see "Fixes shipped". |
| Multi-vendor isolation (`scope()`) | ✅ Verified | Owner / employee / super-owner / super-admin paths correct. |
| LocalStorage hydration | ✅ Stable | Reads are try/catch wrapped, hydration is atomic, mount-only restore log. |
| Analytics centralization | ⚠ Partial | Logic is duplicated between `dataService` and `demoDataService` but only one path executes (demo flag). Pulling into shared selectors deferred — see "Deferred". |
| Route guards / sidebar visibility | ✅ Verified | Sidebar already filters by `can()` + super-owner per-gym module map; no leakage detected. |
| Recycle-bin / soft-delete | ✅ OK | TTL = 24h, cleanup runs hourly + on app load. |

## Fixes shipped

### 1. `src/demo/demoDataService.ts` — RBAC gate corrections
Real bugs where employees with valid permissions were rejected:
- `getPlans` / `createPlan` / `updatePlan` / `deletePlan` were gated on `settings:view|edit` instead of `plans:view|edit`. Employees with the `viewer` or `manager` preset granted `plans:view` were blocked from listing plans.
- `getDashboardStats`, `getRevenueChart`, `getAnalytics` were gated on `reports:view`. Employee presets like `trainer` and `reception` have `dashboard:view` but not `reports:view`, so the dashboard their sidebar showed them was empty/threw. Re-gated on `dashboard:view` (correct semantic — `reports` is a separate dedicated reports area).
- `'trainers' as any` casts removed — `trainers` is now part of the `Module` union.

### 2. `src/demo/dataIntegrity.ts` (new) — relation validator
Pure function that walks the demo dataset and reports:
- Duplicate ids per collection
- Orphan `vendor_id`, `plan_id`, `member_id`, `trainer_id`, `assignment_id` references
- PT payments that reference unknown `assignment_id` or `trainer_id`
- `sessions_completed > total_sessions` impossibility
- Super-owner access rows pointing at deleted vendors / users
- Invalid amounts / missing dates

Returns an `IntegrityReport`. Logs only when `import.meta.env.DEV` or `localStorage.gymos_audit_verbose` is set, so production stays quiet. Hooked into `loadDemoDataset()` so every reset surfaces broken state immediately.

## Verified-clean (no change needed)

- `scope()` in `demoDataService.ts` — combines `allowed` set + active vendor scope correctly for all four roles.
- `checkPermission()` — short-circuits super-owner per-gym checks before falling through to vendor-lock and OWNER_FULL paths. Edit actions correctly blocked for vendor-locked owners and "All Gyms" super-owners.
- `DemoModeProvider` — single mount-only restore log; `refresh()` re-reads from storage on `gymos:demo-changed` event and native `storage` event; no duplicate hydration loop.
- Adapter functions (`adaptMember`, `adaptPayment`, …) already null-guard plan / member lookups, so an orphan ref renders as "Unknown" / `null` rather than crashing.
- `runRecycleCleanup()` is a pure-functional sweep saved only when something actually expired — no needless writes.

## Deferred (intentional, with rationale)

These items in the original 14-section ask were considered but **not** changed in this pass because the risk of regression in already-working modules outweighed the gain. Each is concrete enough to pick up as a follow-up.

1. **Analytics math centralization.** `getAnalytics` exists in both `dataService.ts` (legacy single-vendor mock) and `demoDataService.ts` (multi-vendor). At runtime only one path executes (demo flag toggles which). Extracting a shared `analyticsSelectors.ts` is mechanical but touches every dashboard component's typing — best done as a dedicated PR with snapshot tests.
2. **Component-level chart math.** A few cards (e.g. `AnalyticsKpis`, `LeadsDashboardCharts`) re-derive numbers from arrays they already received. None are wrong, just duplicated. Worth consolidating once (1) is done.
3. **Route-level RBAC guards.** Sidebar visibility is enforced; URL guessing currently still renders a page that throws inside the data hook (caught and shown as empty). An `<RoleGate>` wrapper at the route level would be cleaner. Low priority — there's no data leakage today.
4. **Trainer assignment auto-payment date.** When `start_date` is in the future, an auto PT payment is created with that future date and `paid` status. Cosmetic in analytics — left as-is to preserve the "PT revenue counted at assignment" semantics already used by the dashboard.
5. **`gym_settings` / `contact_settings` are still single-row globals** in the legacy `mockDb` path. In demo (multi-vendor) mode these come from `seedDemoData` per vendor. No bug, but the legacy path will be irrelevant once demo becomes the only source — can be deleted then.

## How to inspect integrity at runtime

```js
// Force a re-audit and log everything (no reload needed):
localStorage.setItem('gymos_audit_verbose', '1');
(await import('/src/demo/dataIntegrity.ts')).auditDemoIntegrity();
```

The next "Reset Demo" / "Load Demo Data" click will also print a `[demo-integrity]` line.
