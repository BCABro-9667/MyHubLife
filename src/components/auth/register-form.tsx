
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Chrome } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

interface RegisterFormProps {
  onSuccess?: () => void; // Callback for successful registration
  onSwitchToLogin?: () => void; // Callback to switch to login modal
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Registration Successful", description: "Welcome to MyLifeHub!" });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
      toast({ title: "Registration Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Google Sign-Up Successful", description: "Welcome!" });
       if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err: any)
    {
      setError(err.message || "Failed to sign up with Google.");
      toast({ title: "Google Sign-Up Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
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
          <Label htmlFor="modal-password-register">Password</Label>
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
        <Button type="submit" className="w-full h-11" disabled={isLoading || isGoogleLoading}>
          {isLoading ? 'Creating Account...' : <> <UserPlus className="mr-2 h-4 w-4" /> Sign Up with Email</>}
        </Button>
      </form>

      <div className="flex items-center">
        <Separator className="flex-grow" />
        <span className="mx-3 text-xs text-muted-foreground">OR</span>
        <Separator className="flex-grow" />
      </div>

      <Button 
        variant="outline" 
        className="w-full h-11" 
        onClick={handleGoogleSignUp}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? 'Signing up...' : <><Chrome className="mr-2 h-4 w-4" /> Sign Up with Google</>}
      </Button>

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
