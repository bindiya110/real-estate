import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { setSessionExpiredHandler } from '../services/api';
import queryKeys from '../hooks/queryKeys';

const AuthContext = createContext(null);

// Queries that hold data belonging to the signed-in user and must be dropped on logout.
const PRIVATE_KEYS = [queryKeys.my.all, queryKeys.favorites.all, queryKeys.admin.all];

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: authService.me,
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const user = data?.data?.user ?? null;

  const setUser = useCallback(
    (nextUser) => queryClient.setQueryData(queryKeys.me, { success: true, data: { user: nextUser } }),
    [queryClient],
  );

  const clearPrivateData = useCallback(() => {
    PRIVATE_KEYS.forEach((key) => queryClient.removeQueries({ queryKey: key }));
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      const hadUser = Boolean(queryClient.getQueryData(queryKeys.me)?.data?.user);
      setUser(null);
      clearPrivateData();
      if (hadUser) toast.error('Your session has expired. Please log in again.');
    });
  }, [queryClient, setUser, clearPrivateData]);

  const login = useCallback(
    async (credentials) => {
      const res = await authService.login(credentials);
      clearPrivateData();
      setUser(res.data.user);
      return res;
    },
    [setUser, clearPrivateData],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authService.register(payload);
      clearPrivateData();
      setUser(res.data.user);
      return res;
    },
    [setUser, clearPrivateData],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      clearPrivateData();
    }
  }, [setUser, clearPrivateData]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isAgent: user?.role === 'agent',
      login,
      register,
      logout,
      setUser,
    }),
    [user, isLoading, login, register, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
