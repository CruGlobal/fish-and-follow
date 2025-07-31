import { useState, useCallback } from "react";
import { useDebounceCallback } from "./useDebounce";

interface UseServerSearchOptions<T> {
  searchFunction: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minSearchLength?: number;
}

interface UseServerSearchReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  searchQuery: string;
  clearSearch: () => void;
}

export function useServerSearch<T>({
  searchFunction,
  debounceMs = 300,
  minSearchLength = 0
}: UseServerSearchOptions<T>): UseServerSearchReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < minSearchLength) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const results = await searchFunction(query);
      setData(results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction, minSearchLength]);

  // Use debounced callback function
  const debouncedSearch = useDebounceCallback(performSearch, debounceMs, [performSearch]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query || query.trim() === "") {
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setData([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    search,
    searchQuery,
    clearSearch
  };
}
