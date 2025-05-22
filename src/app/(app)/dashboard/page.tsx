
"use client";

import { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import { DashboardCard } from '@/components/dashboard-card';
import { useLocalStorage } from '@/lib/localStorage';
import type { Todo, PasswordEntry, WebsiteLink, CardInfo, Plan, Story, Album } from '@/types';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import {
  LayoutDashboard,
  ListChecks,
  Lock,
  Link as LinkIcon,
  CreditCard,
  ClipboardList,
  BookText,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { userId, loading: authLoading } = useAuth(); // Get userId

  // Pass userId to useLocalStorage for all user-specific data
  const [todos] = useLocalStorage<Todo[]>('todos', [], userId);
  const [passwords] = useLocalStorage<PasswordEntry[]>('passwords', [], userId);
  const [links] = useLocalStorage<WebsiteLink[]>('links', [], userId);
  const [cards] = useLocalStorage<CardInfo[]>('cards', [], userId);
  const [plans] = useLocalStorage<Plan[]>('plans', [], userId);
  const [stories] = useLocalStorage<Story[]>('stories', [], userId);
  const [albums] = useLocalStorage<Album[]>('gallery-albums', [], userId); // Assuming albums are also user-specific
  
  const [counts, setCounts] = useState({
    todos: 0,
    passwords: 0,
    links: 0,
    cards: 0,
    plans: 0,
    stories: 0,
    albums: 0,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    // Only update counts if data is loaded and user is authenticated
    if (mounted && !authLoading && userId) {
      setCounts({
        todos: todos.length,
        passwords: passwords.length,
        links: links.length,
        cards: cards.length,
        plans: plans.length,
        stories: stories.length,
        albums: albums.length,
      });
    } else if (mounted && !authLoading && !userId) {
      // If user logs out, reset counts
       setCounts({ todos: 0, passwords: 0, links: 0, cards: 0, plans: 0, stories: 0, albums: 0 });
    }
  }, [todos, passwords, links, cards, plans, stories, albums, mounted, authLoading, userId]);

  const dashboardItems = [
    { title: 'Todos', description: 'Manage your daily tasks.', link: '/todos', itemCount: counts.todos, Icon: ListChecks },
    { title: 'Passwords', description: 'Securely store your logins.', link: '/passwords', itemCount: counts.passwords, Icon: Lock },
    { title: 'Web Links', description: 'Organize your favorite websites.', link: '/links', itemCount: counts.links, Icon: LinkIcon },
    { title: 'Card Safe', description: 'Keep track of card-related links & notes.', link: '/cards', itemCount: counts.cards, Icon: CreditCard },
    { title: 'Plans', description: 'Outline your short and long-term goals.', link: '/plans', itemCount: counts.plans, Icon: ClipboardList },
    { title: 'Stories', description: 'Jot down your creative narratives.', link: '/stories', itemCount: counts.stories, Icon: BookText },
    { title: 'Gallery', description: 'Curate your photo albums.', link: '/gallery', itemCount: counts.albums, Icon: ImageIcon },
    { title: 'AI Suggestions', description: 'Get smart ideas for new entries.', link: '/ai-suggestions', Icon: Sparkles, ctaText: "Explore" },
  ];
  
  // Show loading state if not mounted or auth is loading
  if (!mounted || authLoading) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardItems.map((item) => (
            <DashboardCard
              key={item.title}
              title={item.title}
              description={item.description}
              link={item.link}
              // Only show item count if user is logged in, otherwise it might show stale data before resetting
              itemCount={userId ? item.itemCount : undefined} 
              Icon={item.Icon}
              ctaText={item.ctaText}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
