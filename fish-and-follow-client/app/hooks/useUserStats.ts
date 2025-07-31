import { useState, useEffect, useCallback } from "react";
import { apiService } from "~/lib/api";

interface UserStats {
  total: number;
  adminCount: number;
  staffCount: number;
}

interface UseUserStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedStats = await apiService.getUserStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      setError('Failed to load user statistics');
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
