import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useMemo } from 'react';
import { ApiErrorHandler } from '../../services/ApiErrorHandler';
import { ApiService } from '../../services/ApiService';
import { AuthenticationService } from '../../services/AuthenticationService';
import { LocalStorageService } from '../../services/LocalStorageService';
import { LoggingService } from '../../services/LoggingService';
import { TokenManager } from '../../services/TokenManager';
import type { IJwtDecoder } from '../../interfaces';

export const useServices = () => {
  const localStorageService = useMemo(() => new LocalStorageService(), []);

  const jwtDecoderWrapper: IJwtDecoder = useMemo(
    () => ({
      decode: (token, options) => jwtDecode(token, options as Parameters<typeof jwtDecode>[1]),
    }),
    []
  );

  const tokenManager = useMemo(
    () => new TokenManager(localStorageService, axios, jwtDecoderWrapper),
    [localStorageService]
  );

  const apiService = useMemo(() => {
    const service = new ApiService(axios, tokenManager, new ApiErrorHandler());
    return service;
  }, [tokenManager]);

  const authService = useMemo(() => {
    return new AuthenticationService(axios, tokenManager, LoggingService);
  }, [tokenManager]);

  return { apiService, localStorageService, tokenManager, authService };
};
