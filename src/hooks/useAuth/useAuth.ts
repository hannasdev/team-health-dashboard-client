import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../useServices';

export const useAuth = () => {
  const { authService, tokenManager } = useServices();
  const [isLoggedIn, setIsLoggedIn] = useState(tokenManager.hasValidAccessToken());

  const checkLoginStatus = useCallback(() => {
    const loggedIn = tokenManager.hasValidAccessToken();
    setIsLoggedIn(loggedIn);
  }, [tokenManager]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await authService.login(email, password);
        checkLoginStatus();
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        setIsLoggedIn(false);
        throw error;
      }
    },
    [authService, checkLoginStatus]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      try {
        await authService.register(email, password);
        checkLoginStatus();
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    [authService, checkLoginStatus]
  );

  const logout = useCallback(() => {
    authService.logout();
    setIsLoggedIn(false);
  }, [authService]);

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [checkLoginStatus]);

  return { isLoggedIn, login, register, logout };
};
