
"use client";

import type { User as AppUser } from '@/types'; // Renamed to avoid conflict if User from firebase/auth was used
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after login/logout
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<AppUser | null>;
  register: (email: string, password: string) => Promise<AppUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "currentUser";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Initially true to load from localStorage
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Try to load user from localStorage on initial mount
    setLoading(true);
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: AppUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setUserId(parsedUser.id);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY); // Clear corrupted data
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setCurrentUser(data.user);
      setUserId(data.user.id);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setLoading(false);
      return data.user;
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      setCurrentUser(null);
      setUserId(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      setLoading(false);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<AppUser | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // Automatically log in the user after successful registration
      setCurrentUser(data.user);
      setUserId(data.user.id);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setLoading(false);
      return data.user;
    } catch (error) {
      console.error("Registration error in AuthContext:", error);
      setCurrentUser(null);
      setUserId(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      setLoading(false);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const logout = useCallback(() => {
    // No API call needed for simple client-side logout for this example
    // For token-based auth, you'd call an API to invalidate the token
    router.push('/'); // Redirect to home page first
    setCurrentUser(null);
    setUserId(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [router, toast]);

  const value = {
    currentUser,
    loading,
    userId,
    login,
    register,
    logout,
  };

  // Do not render children until loading from localStorage is complete
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
