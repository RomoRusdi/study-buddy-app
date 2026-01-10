import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize with initialValue first, then sync with localStorage
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item, (k, value) => {
          if (k === 'dueDate' || k === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    setIsInitialized(true);
  }, [key]);

  // Save to localStorage when value changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [key, storedValue, isInitialized]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  }, []);

  return [storedValue, setValue];
}
