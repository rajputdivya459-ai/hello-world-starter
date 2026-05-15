/**
 * GymOS auth context — wraps the localStorage-backed authService and re-renders
 * subscribers when the session changes (login/logout/register).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  hydrateAuth, getCurrentUser, getSession,
  login as svcLogin, register as svcRegister, logout as svcLogout,
  resetPassword as svcResetPassword, loginAsDemoUser as svcLoginAsDemoUser,
  type AuthResult, type RegisterInput,
} from '@/services/authService';
import { DEMO_CHANGE_EVENT } from '@/demo/storage';
import type { DemoUser } from '@/demo/types';

interface GymAuthValue {
  user: DemoUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (mobile: string, password: string) => AuthResult;
  loginAsDemo: (userId: string) => AuthResult;
  register: (input: RegisterInput) => AuthResult;
  resetPassword: (mobile: string, newPassword: string) => AuthResult;
  logout: () => void;
}

const Ctx = createContext<GymAuthValue | null>(null);

export function useGymAuth(): GymAuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGymAuth must be used within <GymAuthProvider>');
  return v;
}

export function GymAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => {
    hydrateAuth();
    return getCurrentUser();
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(DEMO_CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(DEMO_CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  const value = useMemo<GymAuthValue>(() => ({
    user,
    isAuthenticated: !!user && !!getSession(),
    loading,
    login: (m, p) => { setLoading(true); const r = svcLogin(m, p); refresh(); setLoading(false); return r; },
    loginAsDemo: (id) => { const r = svcLoginAsDemoUser(id); refresh(); return r; },
    register: (i) => { setLoading(true); const r = svcRegister(i); refresh(); setLoading(false); return r; },
    resetPassword: (m, p) => svcResetPassword(m, p),
    logout: () => { svcLogout(); refresh(); },
  }), [user, loading, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
