
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  ListChecks,
  Lock,
  Link as LinkIcon,
  CreditCard,
  ClipboardList,
  BookText,
  Image as ImageIcon,
  Sparkles,
  LogOut,
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

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/todos', label: 'Todos', icon: ListChecks },
  { href: '/passwords', label: 'Passwords', icon: Lock },
  { href: '/links', label: 'Web Links', icon: LinkIcon },
  { href: '/cards', label: 'Card Safe', icon: CreditCard },
  { href: '/plans', label: 'Plans', icon: ClipboardList },
  { href: '/stories', label: 'Stories', icon: BookText },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  // AI Suggestions can be part of the nav or accessed via a dedicated page/button
  { href: '/ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth(); // Get currentUser for conditional rendering
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Sidebar side="left" variant="inset" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">MyLifeHub</span>
        </Link>
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
