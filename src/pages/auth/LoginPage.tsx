import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, Phone, Loader2, ChevronRight, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { DEFAULT_DEMO_PASSWORD, ensureDemoCredentials, normalizePhone } from '@/services/authService';
import { loadDemoDataset } from '@/demo/seedAdapter';
import { demoStore } from '@/demo/storage';
import type { DemoUser } from '@/demo/types';

interface DemoOption { user: DemoUser; label: string; vendor?: string; }

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, isAuthenticated } = useGymAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  // Pre-seed demo data + credentials on first visit so the demo selector works.
  useEffect(() => {
    if (!demoStore.isDemoLoaded()) loadDemoDataset();
    ensureDemoCredentials();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const demoOptions = useMemo<DemoOption[]>(() => {
    const users = demoStore.getUsers();
    const sos = demoStore.getSuperOwners();
    const vendors = new Map(demoStore.getVendors().map(v => [v.id, v.name]));
    const out: DemoOption[] = [];
    const sa = users.find(u => u.role === 'super_admin');
    if (sa) out.push({ user: sa, label: 'Super Admin' });
    sos.slice(0, 2).forEach(u => out.push({ user: u, label: 'Super Owner' }));
    users.filter(u => u.role === 'owner').slice(0, 3).forEach(u => out.push({
      user: u, label: 'Gym Owner', vendor: u.vendor_id ? vendors.get(u.vendor_id) : undefined,
    }));
    users.filter(u => u.role === 'employee').slice(0, 2).forEach(u => out.push({
      user: u, label: 'Employee', vendor: u.vendor_id ? vendors.get(u.vendor_id) : undefined,
    }));
    return out;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = login(mobile, password);
    setSubmitting(false);
    if (!r.ok) { setError(r.error || 'Login failed'); return; }
    toast.success(`Welcome back, ${r.user?.name?.split(' ')[0] || ''}`);
    navigate('/app/dashboard', { replace: true });
  };

  const pickDemo = (opt: DemoOption) => {
    const r = loginAsDemo(opt.user.id);
    if (!r.ok) { toast.error(r.error || 'Could not switch'); return; }
    toast.success(`Signed in as ${opt.user.name}`);
    navigate('/app/dashboard', { replace: true });
  };

  const fillDemo = (opt: DemoOption) => {
    const ph = normalizePhone(opt.user.phone || '');
    setMobile(ph);
    setPassword(DEFAULT_DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">GymOS</span>
          </Link>
        </div>

        <Card className="p-7 sm:p-8 shadow-2xl border-border/60 backdrop-blur">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your gym dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobile" type="tel" inputMode="tel" autoComplete="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password" type="password" autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </Button>
          </form>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            New to GymOS?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowDemo(s => !s)}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-primary" />
                Try a demo account
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showDemo ? 'rotate-90' : ''}`} />
            </button>
            {showDemo && (
              <div className="mt-3 grid gap-2 max-h-64 overflow-y-auto pr-1">
                {demoOptions.map(opt => (
                  <div
                    key={opt.user.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 hover:bg-accent/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{opt.user.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                          {opt.label}
                        </Badge>
                        {opt.vendor && (
                          <span className="text-[11px] text-muted-foreground truncate">{opt.vendor}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => fillDemo(opt)}>
                        Fill
                      </Button>
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => pickDemo(opt)}>
                        Login
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-[11px] text-muted-foreground pt-1">
                  Default password for demo accounts: <code className="font-mono">{DEFAULT_DEMO_PASSWORD}</code>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
