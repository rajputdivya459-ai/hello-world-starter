import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, Phone, User, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGymAuth } from '@/contexts/GymAuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useGymAuth();
  const [name, setName] = useState('');
  const [gymName, setGymName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = register({ name, mobile, password, gymName });
    setSubmitting(false);
    if (!r.ok) { setError(r.error || 'Could not register'); return; }
    toast.success(`Account created — welcome ${r.user?.name?.split(' ')[0] || ''}`);
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">GymOS</span>
          </Link>
        </div>

        <Card className="p-7 sm:p-8 shadow-2xl border-border/60">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Set up your gym in under a minute.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field id="name" label="Full name" icon={<User className="h-4 w-4" />}
              value={name} onChange={setName} placeholder="Jane Doe" autoComplete="name" />
            <Field id="gym" label="Gym name (optional)" icon={<Building2 className="h-4 w-4" />}
              value={gymName} onChange={setGymName} placeholder="Iron Forge Fitness" />
            <Field id="mobile" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel"
              icon={<Phone className="h-4 w-4" />}
              value={mobile} onChange={setMobile} placeholder="9876543210" />
            <Field id="password" label="Password" type="password" autoComplete="new-password"
              icon={<Lock className="h-4 w-4" />}
              value={password} onChange={setPassword} placeholder="At least 6 characters" />

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </Button>
          </form>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Field({ id, label, icon, value, onChange, placeholder, type = 'text', inputMode, autoComplete }: {
  id: string; label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; inputMode?: any; autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input id={id} type={type} inputMode={inputMode} autoComplete={autoComplete}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 h-11" />
      </div>
    </div>
  );
}
