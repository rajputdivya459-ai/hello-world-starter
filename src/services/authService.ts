/**
 * Centralized auth service — localStorage + mock DB (Supabase-ready).
 *
 * Storage keys:
 *   gymos_auth_users      — Record<phone, { user_id, password }>  (mobile-keyed lookup)
 *   gymos_auth_passwords  — Record<user_id, string>               (user-keyed lookup)
 *   gymos_auth_session    — { user_id, created_at }               (active session)
 *
 * The "user" itself lives in the existing demoStore (gymos_users / gymos_super_owners)
 * so RBAC + multi-vendor systems keep working unchanged. We only layer credentials
 * + session on top.
 *
 * Future migration: swap these helpers with Supabase auth calls — the surface
 * (login/register/logout/resetPassword/getSession) stays the same.
 */
import { demoStore, emitDemoChange } from '@/demo/storage';
import { loadDemoDataset, isDemoActive } from '@/demo/seedAdapter';
import type { DemoUser, Vendor } from '@/demo/types';

const KEYS = {
  authIndex:    'gymos_auth_users',       // phone -> user_id
  passwords:    'gymos_auth_passwords',   // user_id -> password
  session:      'gymos_auth_session',     // { user_id, created_at }
} as const;

export const DEFAULT_DEMO_PASSWORD = 'demo123';

const isBrowser = typeof window !== 'undefined';

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try { const r = window.localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; }
  catch { return fallback; }
}
function write<T>(key: string, v: T) {
  if (!isBrowser) return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}
function remove(key: string) {
  if (!isBrowser) return;
  try { window.localStorage.removeItem(key); } catch {}
}

// ─── Phone normalization ──────────────────────────────────────────
export function normalizePhone(raw: string): string {
  return (raw || '').replace(/\D+/g, '').replace(/^91/, '');
}

// ─── Credential storage ───────────────────────────────────────────
type AuthIndex = Record<string, string>;        // phone -> userId
type PasswordMap = Record<string, string>;      // userId -> password

function getIndex(): AuthIndex { return read<AuthIndex>(KEYS.authIndex, {}); }
function getPasswords(): PasswordMap { return read<PasswordMap>(KEYS.passwords, {}); }

function setIndex(v: AuthIndex) { write(KEYS.authIndex, v); }
function setPasswords(v: PasswordMap) { write(KEYS.passwords, v); }

/** Seed credentials for every demo user with a phone (idempotent). */
export function ensureDemoCredentials(): void {
  const idx = getIndex();
  const pw = getPasswords();
  let changed = false;

  const all: DemoUser[] = [...demoStore.getUsers(), ...demoStore.getSuperOwners()];
  for (const u of all) {
    if (!u.phone) continue;
    const ph = normalizePhone(u.phone);
    if (!ph) continue;
    if (!idx[ph]) { idx[ph] = u.id; changed = true; }
    if (!pw[u.id]) { pw[u.id] = DEFAULT_DEMO_PASSWORD; changed = true; }
  }
  // Seed super_admin a phone-based login too so demo selector can pick it.
  const sa = demoStore.getUsers().find(u => u.role === 'super_admin');
  if (sa && !sa.phone) {
    // attach a default phone to the user record
    const users = demoStore.getUsers();
    const updated = users.map(u => u.id === sa.id ? { ...u, phone: '+91 9000000001' } : u);
    demoStore.setUsers(updated);
    const ph = '9000000001';
    idx[ph] = sa.id;
    pw[sa.id] = DEFAULT_DEMO_PASSWORD;
    changed = true;
  }

  if (changed) { setIndex(idx); setPasswords(pw); }
}

// ─── Session ──────────────────────────────────────────────────────
export interface AuthSession { user_id: string; created_at: string; }

export function getSession(): AuthSession | null {
  return read<AuthSession | null>(KEYS.session, null);
}

function setSession(s: AuthSession | null) {
  if (s) write(KEYS.session, s); else remove(KEYS.session);
}

export function getCurrentUser(): DemoUser | null {
  const s = getSession();
  if (!s) return null;
  const all = [...demoStore.getUsers(), ...demoStore.getSuperOwners()];
  return all.find(u => u.id === s.user_id) ?? null;
}

// ─── Public API ───────────────────────────────────────────────────
export interface AuthResult { ok: boolean; error?: string; user?: DemoUser; }

/** Make sure the demo dataset (the underlying mock DB) is hydrated before any auth call. */
function ensureDataset() {
  if (!demoStore.isDemoLoaded()) {
    loadDemoDataset();
  }
  ensureDemoCredentials();
}

export function login(mobile: string, password: string): AuthResult {
  ensureDataset();
  const phone = normalizePhone(mobile);
  if (!phone) return { ok: false, error: 'Enter a valid mobile number' };
  if (!password) return { ok: false, error: 'Enter your password' };

  const idx = getIndex();
  const userId = idx[phone];
  if (!userId) return { ok: false, error: 'No account found for this mobile' };

  const pw = getPasswords();
  if (pw[userId] !== password) return { ok: false, error: 'Incorrect password' };

  const all = [...demoStore.getUsers(), ...demoStore.getSuperOwners()];
  const user = all.find(u => u.id === userId);
  if (!user) return { ok: false, error: 'Account record missing — please register again' };

  setSession({ user_id: user.id, created_at: new Date().toISOString() });
  // Hand off to the demo/RBAC layer so the existing dashboard works.
  demoStore.setCurrentUserId(user.id);
  emitDemoChange();
  return { ok: true, user };
}

export function loginAsDemoUser(userId: string): AuthResult {
  ensureDataset();
  const all = [...demoStore.getUsers(), ...demoStore.getSuperOwners()];
  const user = all.find(u => u.id === userId);
  if (!user) return { ok: false, error: 'Demo account not found' };
  // Make sure credentials exist for downstream lookups
  const pw = getPasswords();
  if (!pw[user.id]) { pw[user.id] = DEFAULT_DEMO_PASSWORD; setPasswords(pw); }
  setSession({ user_id: user.id, created_at: new Date().toISOString() });
  demoStore.setCurrentUserId(user.id);
  emitDemoChange();
  return { ok: true, user };
}

export interface RegisterInput { name: string; mobile: string; password: string; gymName?: string; }

export function register(input: RegisterInput): AuthResult {
  ensureDataset();
  const name = (input.name || '').trim();
  const phone = normalizePhone(input.mobile);
  const password = input.password || '';
  if (!name) return { ok: false, error: 'Enter your full name' };
  if (phone.length < 10) return { ok: false, error: 'Enter a valid 10-digit mobile number' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };

  const idx = getIndex();
  if (idx[phone]) return { ok: false, error: 'An account already exists for this mobile' };

  // Create vendor + owner user
  const vendors = demoStore.getVendors();
  const users = demoStore.getUsers();
  const ts = Date.now();
  const vendorId = `vendor_new_${ts}`;
  const userId = `user_owner_new_${ts}`;
  const vendor: Vendor = {
    id: vendorId,
    name: input.gymName?.trim() || `${name.split(' ')[0]}'s Gym`,
    city: '',
    owner_id: userId,
    performance: 'medium',
    created_at: new Date().toISOString(),
  };
  const newUser: DemoUser = {
    id: userId,
    role: 'owner',
    vendor_id: vendorId,
    name,
    phone: `+91 ${phone}`,
    email: undefined,
  };
  demoStore.setVendors([...vendors, vendor]);
  demoStore.setUsers([...users, newUser]);

  // Grant owner full permissions
  const grants = demoStore.getPermissions();
  demoStore.setPermissions([...grants, {
    user_id: userId, vendor_id: vendorId,
    permissions: ['dashboard:view','dashboard:edit','members:view','members:edit','payments:view','payments:edit','leads:view','leads:edit','expenses:view','expenses:edit','plans:view','plans:edit','trainers:view','trainers:edit','website:view','website:edit','recycle:view','recycle:edit','reports:view','settings:view','settings:edit'],
  }]);

  // Persist credentials
  idx[phone] = userId;
  setIndex(idx);
  const pw = getPasswords(); pw[userId] = password; setPasswords(pw);

  setSession({ user_id: userId, created_at: new Date().toISOString() });
  demoStore.setCurrentUserId(userId);
  emitDemoChange();
  return { ok: true, user: newUser };
}

export function resetPassword(mobile: string, newPassword: string): AuthResult {
  ensureDataset();
  const phone = normalizePhone(mobile);
  if (phone.length < 10) return { ok: false, error: 'Enter a valid mobile number' };
  if ((newPassword || '').length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
  const idx = getIndex();
  const userId = idx[phone];
  if (!userId) return { ok: false, error: 'No account found for this mobile' };
  const pw = getPasswords(); pw[userId] = newPassword; setPasswords(pw);
  return { ok: true };
}

export function logout(): void {
  setSession(null);
  // Clear active demo identity but keep demo dataset (so re-login works).
  demoStore.setCurrentUserId(null);
  emitDemoChange();
}

export function isAuthenticated(): boolean {
  return getSession() !== null && getCurrentUser() !== null;
}

/** Re-sync demo currentUser from session on app boot (handles refresh). */
export function hydrateAuth(): void {
  const s = getSession();
  if (!s) return;
  if (!isDemoActive()) {
    // Dataset got cleared but session lingered → reload dataset and re-bind.
    ensureDataset();
  }
  if (demoStore.getCurrentUserId() !== s.user_id) {
    demoStore.setCurrentUserId(s.user_id);
    emitDemoChange();
  }
}
