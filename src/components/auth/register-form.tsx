
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context'; // Using new custom AuthContext
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { register: contextRegister, loading: authContextLoading } = useAuth(); // Get register function from new context

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Registration Failed", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await contextRegister(email, password); // Call the register function from AuthContext
      toast({ title: "Registration Successful", description: "Welcome to MyLifeHub!" });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard'); // Default redirect after successful registration
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
      toast({ title: "Registration Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="modal-email-register">Email</Label>
          <Input
            id="modal-email-register"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modal-password-register">Password (min 6 chars)</Label>
          <Input
            id="modal-password-register"
            type="password"
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modal-confirmPassword-register">Confirm Password</Label>
          <Input
            id="modal-confirmPassword-register"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button type="submit" className="w-full h-11" disabled={isLoading || authContextLoading}>
          {isLoading || authContextLoading ? 'Creating Account...' : <> <UserPlus className="mr-2 h-4 w-4" /> Sign Up with Email</>}
        </Button>
      </form>

      {/* Google Sign-Up removed */}

      {onSwitchToLogin && (
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" className="p-0 h-auto text-xs" onClick={onSwitchToLogin}>
            Log in
          </Button>
        </p>
      )}
    </div>
  );
}
