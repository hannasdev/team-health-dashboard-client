import axios from 'axios';
import { TokenManager } from './TokenManager'; // Update with the correct path
import type { IStorageService } from '../interfaces';

// Mock IStorageService
class MockStorageService implements IStorageService {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.storage[key];
  }
}

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let mockStorage: MockStorageService;

  beforeEach(() => {
    mockStorage = new MockStorageService();
    tokenManager = new TokenManager(mockStorage);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get the token from storage', () => {
    mockStorage.setItem('token', 'test-token');
    const token = tokenManager.getToken();
    expect(token).toBe('test-token');
  });

  it('should return null if token is not in storage', () => {
    const token = tokenManager.getToken();
    expect(token).toBeNull();
  });

  it('should set the token in storage', () => {
    tokenManager.setToken('new-token');
    expect(mockStorage.getItem('token')).toBe('new-token');
  });

  it('should refresh the token and update storage', async () => {
    const mockNewToken = 'new-access-token';

    // *** FIX 1: Mock axios.post BEFORE setting the refresh token ***
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: { token: mockNewToken },
    });

    // Set up the refresh token in mock storage
    const refreshToken = 'test-refresh-token';
    mockStorage.setItem('refreshToken', refreshToken);

    const newToken = await tokenManager.refreshToken();

    expect(axios.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken });
    expect(newToken).toBe(mockNewToken);
    expect(mockStorage.getItem('token')).toBe(mockNewToken);
  });

  it('should throw an error if refresh token is not available', async () => {
    mockStorage.removeItem('refreshToken');

    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} });

    await expect(tokenManager.refreshToken()).rejects.toThrow('No refresh token available');

    expect(axios.post).not.toHaveBeenCalled();
  });
});
