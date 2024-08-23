import { useMemo } from 'react';
import { ApiService } from '../services/ApiService';
import { LocalStorageService } from '../services/LocalStorageService';
import { AuthenticationService } from '../services/AuthenticationService';
import { jwtDecode } from 'jwt-decode';
import { LoggingService } from '../services/LoggingService';
import type { ITokenRefreshResult } from '../interfaces';

export const useServices = () => {
  const localStorageService = useMemo(() => new LocalStorageService(), []);

  const apiService: ApiService = useMemo(() => {
    const service = new ApiService(
      '/api',
      {
        handleError: (error: Error) => {
          console.error('API Error:', error);
          // Implement more robust error handling here
        },
      },
      {
        getToken: () => localStorageService.getItem('accessToken'),
        setToken: (token: string) => {
          localStorageService.setItem('accessToken', token);
        },
        refreshToken: async (): Promise<string> => {
          const authService = new AuthenticationService(
            service.getAxiosInstance(),
            localStorageService,
            jwtDecode,
            LoggingService
          );
          const result: ITokenRefreshResult | null = await authService.refreshToken();
          return result ? result.accessToken : '';
        },
      }
    );
    return service;
  }, [localStorageService]);

  return { apiService, localStorageService };
};
