
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common modern sans-serif
import './globals.css';
import { cn } from '@/lib/utils';

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
        {children}
      </body>
    </html>
  );
}
