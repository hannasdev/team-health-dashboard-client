export interface ITokenManager {
  getToken(): string | null;
  refreshToken(): Promise<string>;
  setToken(token: string): void;
}
