
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form'; // Import the new LoginForm

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const redirectPath = queryParams.get('redirect') || '/dashboard';

    if (!authLoading && currentUser) {
      router.push(redirectPath);
    }
  }, [currentUser, authLoading, router]);
  
  if (authLoading || (!authLoading && currentUser)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-16 w-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your MyLifeHub dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Use the LoginForm component */}
          <LoginForm 
            onSuccess={() => {
              const queryParams = new URLSearchParams(window.location.search);
              router.push(queryParams.get('redirect') || '/dashboard');
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
