import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing callback functions
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array (similar to useCallback)
 * @returns The debounced callback function
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Advanced debounce hook with immediate execution option and loading state
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param immediate - Whether to execute immediately on first call
 * @returns Object with debounced value, loading state, and cancel function
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  immediate = false
): {
  debouncedValue: T;
  isDebouncing: boolean;
  cancel: () => void;
} {
  const [debouncedValue, setDebouncedValue] = useState<T>(immediate ? value : ({} as T));
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRun = useRef(true);

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsDebouncing(false);
    }
  };

  useEffect(() => {
    // Handle immediate execution on first run
    if (immediate && isFirstRun.current) {
      setDebouncedValue(value);
      isFirstRun.current = false;
      return;
    }

    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    timeoutRef.current = handler;

    return () => {
      clearTimeout(handler);
      setIsDebouncing(false);
    };
  }, [value, delay, immediate]);

  return { debouncedValue, isDebouncing, cancel };
}

/**
 * Hook for debouncing search functionality specifically
 * @param searchTerm - The search term to debounce
 * @param onSearch - Callback function to execute with debounced search term
 * @param delay - Delay in milliseconds (default: 300ms)
 * @param minLength - Minimum search term length before executing search (default: 0)
 */
export function useDebounceSearch(
  searchTerm: string,
  onSearch: (term: string) => void | Promise<void>,
  delay = 300,
  minLength = 0
): {
  isSearching: boolean;
  cancelSearch: () => void;
} {
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchRef = useRef(onSearch);

  // Update ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const cancelSearch = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search if term is too short (but allow empty string if minLength is 0)
    if (searchTerm.length < minLength) {
      setIsSearching(false);
      const result = onSearchRef.current('');
      if (result instanceof Promise) {
        result.catch(error => console.error('Search error:', error));
      }
      return;
    }

    // For empty search terms, execute immediately without debounce
    if (searchTerm === '' && minLength === 0) {
      setIsSearching(false);
      const result = onSearchRef.current('');
      if (result instanceof Promise) {
        result.catch(error => console.error('Search error:', error));
      }
      return;
    }

    setIsSearching(true);

    const handler = setTimeout(async () => {
      try {
        await onSearchRef.current(searchTerm);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    timeoutRef.current = handler;

    return () => {
      clearTimeout(handler);
      setIsSearching(false);
    };
  }, [searchTerm, delay, minLength]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isSearching, cancelSearch };
}
