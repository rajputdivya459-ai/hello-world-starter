import { Navigate, useLocation } from 'react-router-dom';
import { useGymAuth } from '@/contexts/GymAuthContext';
import type { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  /** Optional: restrict to specific roles. */
  roles?: Array<'super_admin' | 'super_owner' | 'owner' | 'employee'>;
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { isAuthenticated, user } = useGymAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role as any)) {
    return <Navigate to="/access-restricted" replace />;
  }
  return <>{children}</>;
}
