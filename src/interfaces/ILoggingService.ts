// src/interfaces/ILoggingService.ts

export interface ILoggingService {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
}
