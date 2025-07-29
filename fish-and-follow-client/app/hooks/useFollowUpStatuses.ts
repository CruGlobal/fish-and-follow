import { useState, useEffect, useCallback } from "react";
import { apiService } from "../lib/api";
import type { FollowUpStatus, NewFollowUpStatusData } from "~/types/followUpStatus";

export function useFollowUpStatuses() {
  const [statuses, setStatuses] = useState<FollowUpStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedStatuses = await apiService.getFollowUpStatuses();
      setStatuses(fetchedStatuses);
    } catch (err) {
      console.error("Failed to fetch follow-up statuses:", err);
      setError("Failed to fetch follow-up statuses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const addStatus = async (statusData: NewFollowUpStatusData) => {
    try {
      setIsLoading(true);
      const newStatus = await apiService.createFollowUpStatus(statusData);
      setStatuses(prev => [...prev, newStatus]);
      setError(null);
      return newStatus;
    } catch (err) {
      setError("Failed to add follow-up status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (number: number, description: string) => {
    try {
      setIsLoading(true);
      const updatedStatus = await apiService.updateFollowUpStatus(number, description);
      setStatuses(prev => prev.map(status => 
        status.number === number ? updatedStatus : status
      ));
      setError(null);
      return updatedStatus;
    } catch (err) {
      setError("Failed to update follow-up status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    statuses,
    isLoading,
    error,
    fetchStatuses,
    addStatus,
    updateStatus,
  };
}

// Helper function to get status description by number
export function getStatusDescription(statuses: FollowUpStatus[], statusNumber: number): string {
  const status = statuses.find(s => s.number === statusNumber);
  return status?.description || `Status ${statusNumber}`;
}
