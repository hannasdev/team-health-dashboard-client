import type { IApiClient, ITokenManager } from '../../interfaces';

export class HttpClient {
  constructor(
    private readonly apiService: IApiClient,
    private readonly tokenManager: ITokenManager
  ) {}

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    await this.ensureValidToken();
    return this.apiService.get<T>(url, params);
  }

  public async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    await this.ensureValidToken();
    return this.apiService.post<T>(url, data);
  }

  public async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    await this.ensureValidToken();
    return this.apiService.put<T>(url, data);
  }

  public async delete<T>(url: string): Promise<T> {
    await this.ensureValidToken();
    return this.apiService.delete<T>(url);
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.tokenManager.hasValidAccessToken()) {
      await this.tokenManager.refreshToken();
    }
  }
}
