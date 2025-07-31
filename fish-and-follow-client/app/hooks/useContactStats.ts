import { useState, useEffect, useCallback } from "react";
import { apiService } from "~/lib/api";

interface ContactStats {
  total: number;
  interested: number;
  notInterested: number;
  maleCount: number;
  femaleCount: number;
}

interface UseContactStatsReturn {
  stats: ContactStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useContactStats(): UseContactStatsReturn {
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedStats = await apiService.getContactStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to fetch contact stats:', err);
      setError('Failed to load contact statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
}
