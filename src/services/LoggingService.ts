// src/services/LoggingService.ts

export const LoggingService = {
  log(...args: any[]): void {
    console.log(...args);
  },

  error(...args: any[]): void {
    console.error(...args);
  },

  warn(...args: any[]): void {
    console.warn(...args);
  },

  info(...args: any[]): void {
    console.info(...args);
  },
};
