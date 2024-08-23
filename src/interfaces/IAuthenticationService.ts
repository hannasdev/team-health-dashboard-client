import type { IAuthResponse } from './IAuthResponse';
import type { IUser } from './IUser';

export interface IAuthenticationService {
  login(email: string, password: string): Promise<IAuthResponse>;
  register(email: string, password: string): Promise<IAuthResponse>;
  logout(): void;
  getCurrentUser(): Promise<IUser | null>;
  isLoggedIn(): boolean;
  getAccessToken(): string | null;
  refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null>;
  setupTokenRefresh(): void;
  refreshUserActivity(): void;
}
