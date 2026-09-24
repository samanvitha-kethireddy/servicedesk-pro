import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('sdp_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('sdp_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('sdp_token');
    setUser(null);
    toast.success('Logged out');
  };

  const value = { user, setUser, loading, login, register, logout, refetchUser: fetchCurrentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};