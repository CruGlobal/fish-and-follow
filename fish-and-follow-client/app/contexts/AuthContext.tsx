import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export interface IUser {
  id?: string;
  username: string;
  displayName: string;
  role: string;
}

interface IAuthResponse {
  authenticated: boolean;
  user: IUser | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | undefined;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/auth/status', {
        credentials: 'include',
      });
      const data: IAuthResponse = await response.json();

      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser({
          id: data.user.id,
          username: data.user.username,
          displayName: data.user.displayName,
          role: data.user.role,
        });
      } else {
        setIsAuthenticated(false);
        setUser(undefined);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/signin';
  };

  const logout = async () => {
    try {
      await fetch('/signout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setUser(undefined);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

