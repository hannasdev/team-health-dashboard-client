import type { IUser } from './IUser';

export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}
