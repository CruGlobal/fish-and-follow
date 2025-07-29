import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "./api";
import type { User, NewUserData, UserRole } from "~/types/user";

// Types for the role system

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    search?: string;
    role?: string;
  }>({});
  
  // Use ref to track the debounce timeout
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch users with current filters
  const fetchUsers = useCallback(async (filtersToUse?: typeof filters, isFilterUpdate = false) => {
    // Set appropriate loading state
    if (isFilterUpdate) {
      setIsFilterLoading(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const currentFilters = filtersToUse || filters;

    try {
      const response = await apiService.searchUsers(
        currentFilters.search,
        {
          role: currentFilters.role,
        }
      );
      setUsers(response.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
      setIsFilterLoading(false);
    }
  }, [filters]);

  // Debounced fetch function for filter updates
  const debouncedFetchUsers = useCallback((filtersToUse: typeof filters) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchUsers(filtersToUse, true); // Pass true to indicate this is a filter update
    }, 300); // 300ms debounce delay
  }, [fetchUsers]);

  // Fetch users from API on mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array for initial load only

  // Update filters and fetch new data with debouncing
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Use debounced fetch for filter updates to prevent excessive API calls
    debouncedFetchUsers(updatedFilters);
  }, [filters, debouncedFetchUsers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const addUser = async (userData: NewUserData) => {
    try {
      setIsLoading(true);
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      setError(null);
      setIsLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      setError("Failed to add user");
      setIsLoading(false);
      return { success: false, user: null };
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateUser(id, updates);
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? updatedUser : user
        )
      );
      setError(null);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError("Failed to update user");
      setIsLoading(false);
      return { success: false };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        setIsLoading(false);
        return { success: false };
      }
      setIsLoading(true);
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      setError(null);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError("Failed to delete user");
      setIsLoading(false);
      return { success: false };
    }
  };

  const clearError = () => setError(null);

  // Fonctions utilitaires
  const getUsersByRole = (role: UserRole) => users.filter(user => user.role === role);

  return {
    users,
    isLoading,
    isFilterLoading,
    error,
    filters,
    updateFilters,
    addUser,
    updateUser,
    deleteUser,
    clearError,
    // Utility functions
    getUsersByRole,
  };
}
