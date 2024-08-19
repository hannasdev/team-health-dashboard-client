import axios from 'axios';
import type { ITokenManager, IStorageService } from '../interfaces';

export class TokenManager implements ITokenManager {
  constructor(private readonly storageService: IStorageService) {}

  public getToken(): string | null {
    return this.storageService.getItem('token');
  }

  public async refreshToken(): Promise<string> {
    const refreshToken = this.storageService.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });

    this.setToken(response.data.token);

    return response.data.token;
  }

  public setToken(token: string): void {
    this.storageService.setItem('token', token);
  }
}
