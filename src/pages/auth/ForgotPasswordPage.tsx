import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGymAuth } from '@/contexts/GymAuthContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useGymAuth();
  const [mobile, setMobile] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = resetPassword(mobile, pw);
    setSubmitting(false);
    if (!r.ok) { setError(r.error || 'Could not reset password'); return; }
    toast.success('Password updated — please sign in.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
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
            <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your registered mobile number and a new password.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="mobile" type="tel" inputMode="tel" placeholder="9876543210"
                  value={mobile} onChange={(e) => setMobile(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="pw" type="password" placeholder="At least 6 characters"
                  value={pw} onChange={(e) => setPw(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
            </Button>
          </form>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Back to sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
