import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthenticationService } from '../services/AuthenticationService';
import { useServices } from './useServices';
import { jwtDecode } from 'jwt-decode';
import { LoggingService } from '../services/LoggingService';

export const useAuth = () => {
  const { apiService, localStorageService } = useServices();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const authService = useMemo(
    () =>
      new AuthenticationService(
        apiService.getAxiosInstance(),
        localStorageService,
        jwtDecode,
        LoggingService
      ),
    [apiService, localStorageService]
  );

  const checkLoginStatus = useCallback(() => {
    const loggedIn = authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      authService.setupTokenRefresh();
      authService.refreshUserActivity();
    }
  }, [authService]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        await authService.login(username, password);
        const loginCheck = authService.isLoggedIn();
        setIsLoggedIn(loginCheck);
        if (loginCheck) {
          authService.setupTokenRefresh();
          authService.refreshUserActivity();
        }
        return loginCheck;
      } catch (error) {
        LoggingService.error('Login failed:', error);
        setIsLoggedIn(false);
        return false;
      }
    },
    [authService]
  );

  const logout = useCallback(() => {
    authService.logout();
    setIsLoggedIn(false);
  }, [authService]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [checkLoginStatus]);

  return { isLoggedIn, login, logout, authService, checkLoginStatus };
};
