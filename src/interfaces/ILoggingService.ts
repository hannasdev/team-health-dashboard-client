export interface ILoggingService {
  error(message: string, error?: unknown): void;
  warn(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  log(message: string, data?: unknown): void;
}
