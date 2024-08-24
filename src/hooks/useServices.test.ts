// src/hooks/useServices.test.ts
import { renderHook } from '@testing-library/react';
import { useServices } from './useServices';
import { ApiService } from '../services/ApiService/ApiService';
import { LocalStorageService } from '../services/LocalStorageService/LocalStorageService';

jest.mock('../services/ApiService/ApiService');
jest.mock('../services/LocalStorageService/LocalStorageService');

describe('useServices', () => {
  it('should return apiService and localStorageService', () => {
    const { result } = renderHook(() => useServices());

    expect(result.current.apiService).toBeInstanceOf(ApiService);
    expect(result.current.localStorageService).toBeInstanceOf(LocalStorageService);
  });

  it('should create services only once', () => {
    const { result, rerender } = renderHook(() => useServices());

    const firstApiService = result.current.apiService;
    const firstLocalStorageService = result.current.localStorageService;

    rerender();

    expect(result.current.apiService).toBe(firstApiService);
    expect(result.current.localStorageService).toBe(firstLocalStorageService);
  });

  // Add more tests as needed
});
