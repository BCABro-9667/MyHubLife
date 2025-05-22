
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use a ref to store the initialValue to prevent issues if the caller passes a non-stable reference.
  // This is mainly for the 'storage' event listener fallback.
  const initialValueRef = useRef(initialValue);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // This initializer function runs only once on the client during initial render.
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
        return initialValueRef.current;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" during init:`, error);
      // If error, still try to set initialValue in localStorage
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
      } catch (setError) {
        console.error(`Error setting localStorage key "${key}" during init error fallback:`, setError);
      }
      return initialValueRef.current;
    }
  });

  // The original useEffect that depended on [key, initialValue] was the main source of the loop.
  // It has been removed, and its core logic (initial read) is now handled by the useState initializer above.

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue] // Dependencies for useCallback
  );

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
          if (event.newValue) {
            setStoredValue(JSON.parse(event.newValue) as T);
          } else {
            // Value was removed or cleared from localStorage
            // Fallback to the initial value reference.
            setStoredValue(initialValueRef.current);
            // Optionally, re-write initial value to localStorage if it was cleared.
            // window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
          }
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
          setStoredValue(initialValueRef.current);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]); // Only re-subscribe if key changes

  return [storedValue, setValue];
}
