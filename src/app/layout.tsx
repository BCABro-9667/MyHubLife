
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common modern sans-serif
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context'; // Import AuthProvider
import { ThemeProvider } from '@/contexts/theme-context'; // Import ThemeProvider
import { Toaster } from "@/components/ui/toaster"; // Keep Toaster here if it's global

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Changed variable name for clarity
});

export const metadata: Metadata = {
  title: 'MyLifeHub - Personal Dashboard',
  description: 'Manage your life, all in one place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider> {/* Wrap AuthProvider with ThemeProvider */}
          <AuthProvider> {/* Wrap children with AuthProvider */}
            {children}
            <Toaster /> {/* Global Toaster */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
