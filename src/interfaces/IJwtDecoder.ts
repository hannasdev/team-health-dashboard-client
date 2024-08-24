import type { JwtPayload } from 'jwt-decode';

export interface IJwtDecoder {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  decode<T = JwtPayload>(token: string, options?: unknown): T;
}
