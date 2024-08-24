import type { ITokenPayload } from './ITokenPayload';

export interface ITokenManager {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  refreshToken(): Promise<ITokenPayload>;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
  hasValidAccessToken(): boolean;
}
