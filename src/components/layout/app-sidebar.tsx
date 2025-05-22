
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context'; // Import useTheme
import {
  LayoutDashboard,
  ListChecks,
  Lock,
  Link as LinkIcon,
  CreditCard,
  ClipboardList,
  BookText,
  Image as ImageIconLucide, // Renamed to avoid conflict with next/image
  Sparkles,
  LogOut,
  Sun, Moon, Monitor // Icons for theme toggle
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/todos', label: 'Todos', icon: ListChecks },
  { href: '/passwords', label: 'Passwords', icon: Lock },
  { href: '/links', label: 'Web Links', icon: LinkIcon },
  { href: '/cards', label: 'Card Safe', icon: CreditCard },
  { href: '/plans', label: 'Plans', icon: ClipboardList },
  { href: '/stories', label: 'Stories', icon: BookText },
  { href: '/gallery', label: 'Gallery', icon: ImageIconLucide },
  { href: '/ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Navigate to home page FIRST
      router.push('/'); 
      // Then sign out. This ensures AppLayout unmounts or is no longer relevant
      // when currentUser becomes null, preventing its redirect logic.
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Sidebar side="left" variant="inset" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">MyLifeHub</span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* <Button variant="ghost" size="icon" aria-label="Toggle theme">
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                        <Monitor className="mr-2 h-4 w-4" /> System
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right', className: "ml-1" }}
                  className={cn(
                    "justify-start",
                    "group-data-[collapsible=icon]:justify-center"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0">
         <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center mb-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" 
                        className={cn(
                            "w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
                            {"group-data-[collapsible=expanded]:hidden": true} 
                        )}
                        aria-label="Toggle theme"
                     >
                        {resolvedTheme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span className="ml-2 group-data-[collapsible=icon]:hidden">Toggle Theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" sideOffset={10}>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                        <Monitor className="mr-2 h-4 w-4" /> System
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        {currentUser && (
          <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center group-data-[collapsible=icon]:hidden">&copy; {new Date().getFullYear()} MyLifeHub</p>
      </SidebarFooter>
    </Sidebar>
  );
}
