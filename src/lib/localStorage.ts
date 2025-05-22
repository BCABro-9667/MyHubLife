
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(
  baseKey: string,
  initialValue: T,
  userId?: string | null // Optional userId
): [T, (value: T | ((val: T) => T)) => void] {
  
  const getStorageKey = useCallback(() => {
    return userId ? `${userId}_${baseKey}` : baseKey;
  }, [userId, baseKey]);

  const initialValueRef = useRef(initialValue);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }
    // If no userId is provided for user-specific data, we shouldn't attempt to load.
    // However, for general app settings not tied to a user, we might allow it.
    // For now, if userId is explicitly part of the design for this key, and it's missing,
    // we might simply return initialValue and not touch localStorage.
    // Here, we proceed if userId exists OR if userId was not expected (not passed to hook).
    // The logic below will construct key based on userId presence.
    
    const key = getStorageKey();

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      } else {
        // Only set initial value if a user context is relevant (userId provided or not expected)
        // or if it's a non-user-specific key.
        // This prevents writing default data for "user1_todos" if user1 hasn't saved anything yet.
        // A better approach might be to only write if it's an "initial setup" scenario.
        // For simplicity, we'll write it if not found.
        window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
        return initialValueRef.current;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" during init:`, error);
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
      } catch (setError) {
        console.error(`Error setting localStorage key "${key}" during init error fallback:`, setError);
      }
      return initialValueRef.current;
    }
  });

  // Effect to re-initialize or clear data when userId changes (login/logout)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey();
    
    // If there's a userId, load their data. If no userId (logged out), reset to initial.
    if (userId) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item) as T);
        } else {
          // User has no data for this key, set to initial and store it
          setStoredValue(initialValueRef.current);
          window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}" on user change:`, error);
        setStoredValue(initialValueRef.current);
      }
    } else {
      // No user, or hook is not intended to be user-specific.
      // If baseKey was used without userId, it might be shared data.
      // If it was user-specific and user logged out, reset to initial.
      // For data that *must* be user-specific, pages should handle this.
      // Here, we reset to initialValue if userId was expected but is now null.
      // This logic depends on how you call the hook. If you always pass userId (even if null),
      // then this correctly resets.
      const item = window.localStorage.getItem(baseKey); // Check if non-user-specific data exists
      if (item && !userId) { // if a non-user specific version exists and we are logged out
         try {
            setStoredValue(JSON.parse(item) as T);
         } catch (e) {
            setStoredValue(initialValueRef.current);
         }
      } else { // otherwise reset to initial value
         setStoredValue(initialValueRef.current);
      }
    }
  }, [userId, baseKey, getStorageKey]); // Rerun on userId or baseKey change

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') return;
      
      // If this hook is meant to be user-specific but there's no user, don't save.
      // This check needs to be robust: was `userId` parameter *ever* intended for this hook instance?
      // For now, if `userId` prop is null/undefined during a save, and it was expected, we might skip.
      // The current implementation always gets a key, user-specific or not.
      // If `userId` is undefined (logged out), it saves to `_baseKey` which might be undesirable.
      // A stricter approach: if called with `userId` (even if null), and `userId` is currently null, do not save.
      // However, `getStorageKey` already handles this by creating `null_baseKey` vs `baseKey`.
      // Let's ensure if `userId` was passed as `null` explicitly for logout, it doesn't write to `null_baseKey`.
      // The current `getStorageKey` returns `baseKey` if `userId` is null/undefined.
      // This is okay for items that are not user-specific.
      // For items that *are* user-specific, the page itself should not call `setValue` if `userId` is null.

      // The component using this hook should ideally not call `setValue` if `userId` is null
      // and the data is meant to be user-specific.
      // If `userId` is undefined (logged out for user specific data), we should not attempt to save to a generic key.
      // Let's modify this: if `userId` was explicitly passed as part of the hook's intended behavior (even if currently null)
      // and it *is* null, then we do not save. This requires knowing if `userId` was *ever* intended.
      // A simpler rule: if userId argument exists and is currently null, don't write.
      // This means the hook should be called without the userId argument for non-user-specific data.

      // If the hook is initialized with an undefined userId argument (for non-user-specific data), then userId will be undefined here.
      // If it's initialized with a userId (even if it becomes null later after logout), then userId will be null here.
      // This check is tricky. Let's assume if `userId` (the parameter of the hook) is undefined, it's a global key.
      // If `userId` (the parameter) is passed (even as null), it implies user-specificity.
      // So, if `userId` (parameter) is null, we don't save.

      // The current behavior of `getStorageKey` is: if `userId` (state) is null, use `baseKey`.
      // This means logged-out state writes to non-prefixed key.
      // We need to prevent writing user-specific data if user is logged out.
      // The calling component should manage this.
      // The `(app)` layout already prevents rendering pages if not logged in.
      // So, by the time `setValue` is called from within `(app)`, `userId` should exist.

      const key = getStorageKey();
      if (!userId && key === baseKey) {
        // This condition means userId is null/undefined (logged out or never was user-specific)
        // AND the key is the baseKey (not user-prefixed).
        // This is for truly global settings, allow write.
      } else if (!userId) {
        // userId is null/undefined, but the key would have been prefixed if userId existed.
        // This means user logged out. Do not write to a generic key.
        // console.warn(`useLocalStorage: Attempted to write to user-specific key "${baseKey}" without a userId. Operation skipped.`);
        return; 
      }


      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [getStorageKey, storedValue, userId, baseKey] 
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const keyToListen = getStorageKey();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === keyToListen && event.storageArea === window.localStorage) {
        try {
          if (event.newValue) {
            setStoredValue(JSON.parse(event.newValue) as T);
          } else {
            setStoredValue(initialValueRef.current);
          }
        } catch (error) {
          console.error(`Error parsing storage event for key "${keyToListen}":`, error);
          setStoredValue(initialValueRef.current);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getStorageKey]);

  return [storedValue, setValue];
}
