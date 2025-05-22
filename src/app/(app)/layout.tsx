
"use client"; // Required for hooks like useRouter and useAuth

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Sparkles } from 'lucide-react'; // For loading indicator

// Toaster is now in RootLayout
// import { Toaster } from "@/components/ui/toaster"; 

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      // If not loading and no user, redirect to login
      // Preserve the intended path for redirection after login
      router.push(`/login?redirect=${pathname}`);
    }
  }, [currentUser, loading, router, pathname]);

  if (loading || !currentUser) {
    // Show a loading indicator or a blank page while checking auth / redirecting
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Sparkles className="h-16 w-16 animate-pulse text-primary" />
      </div>
    );
  }

  // User is authenticated, render the app layout
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-y-auto">
          {children}
        </SidebarInset>
      </div>
      {/* Toaster is moved to RootLayout to be available on login/register pages too */}
      {/* <Toaster /> */}
    </SidebarProvider>
  );
}
