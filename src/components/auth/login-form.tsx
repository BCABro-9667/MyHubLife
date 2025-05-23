
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context'; // Using new custom AuthContext
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login: contextLogin, loading: authContextLoading } = useAuth(); // Get login function from new context

  const getRedirectPath = () => {
    return searchParams?.get('redirect') || '/dashboard';
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await contextLogin(email, password); // Call the login function from AuthContext
      toast({ title: "Login Successful", description: "Welcome back!" });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(getRedirectPath());
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
      toast({ title: "Login Failed", description: err.message || "Please check your credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="modal-email-login">Email</Label>
          <Input
            id="modal-email-login"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modal-password-login">Password</Label>
          <Input
            id="modal-password-login"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button type="submit" className="w-full h-11" disabled={isLoading || authContextLoading}>
          {isLoading || authContextLoading ? 'Logging in...' : <> <LogIn className="mr-2 h-4 w-4" /> Log In with Email</>}
        </Button>
      </form>
      
      {/* Google Sign-In removed as per request to move away from Firebase Auth */}

      {onSwitchToRegister && (
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button variant="link" className="p-0 h-auto text-xs" onClick={onSwitchToRegister}>
            Sign up
          </Button>
        </p>
      )}
    </div>
  );
}
