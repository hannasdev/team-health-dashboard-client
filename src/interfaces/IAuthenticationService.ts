import type { IAuthResponse } from './IAuthResponse';
import type { IUser } from './IUser';

export interface IAuthenticationService {
  login(email: string, password: string): Promise<IAuthResponse>;
  register(name: string, email: string, password: string): Promise<IAuthResponse>;
  logout(): void;
  getCurrentUser(): Promise<IUser | null>;
  refreshToken(): Promise<string | null>;
}
