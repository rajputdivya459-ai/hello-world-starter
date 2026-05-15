import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AccessRestrictedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-destructive/5">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="p-10 max-w-md text-center border-border/60 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Access restricted</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            You need to sign in to view this page. If you believe this is an error,
            please contact your gym administrator.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/"><Button variant="outline" className="w-full sm:w-auto"><Home className="h-4 w-4 mr-2" /> Home</Button></Link>
            <Link to="/login"><Button className="w-full sm:w-auto"><LogIn className="h-4 w-4 mr-2" /> Sign in</Button></Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
