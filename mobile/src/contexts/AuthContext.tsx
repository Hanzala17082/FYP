import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserDTO, AuthResponseDTO } from '../types/api';
import { api, clearTokens, setTokens } from '../lib/api';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api<AuthResponseDTO>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
      });
      if (res.data?.user) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
      } else {
        setUser(null);
        clearTokens();
      }
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string, role: string) => {
    const res = await api<AuthResponseDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.data?.accessToken) throw new Error('Login failed');
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
