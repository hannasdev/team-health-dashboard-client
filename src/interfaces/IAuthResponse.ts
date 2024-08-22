import type { IUser } from './IUser';

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
