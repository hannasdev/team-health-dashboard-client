// src/services/LoggingService/LoggingService.test.ts
import { LoggingService } from './LoggingService';
import { createMockLoggingService } from '../../__mocks__/mockFactories';

describe('LoggingService', () => {
  let originalConsole: Console;

  beforeAll(() => {
    originalConsole = global.console;
    global.console = {
      ...global.console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('log method', () => {
    it('should call console.log with the provided arguments', () => {
      const message = 'Test log message';
      const data = { key: 'value' };
      LoggingService.log(message, data);
      expect(console.log).toHaveBeenCalledWith(message, data);
    });

    it('should call console.log with only the message if no data is provided', () => {
      const message = 'Test log message';
      LoggingService.log(message);
      expect(console.log).toHaveBeenCalledWith(message);
    });
  });

  describe('error method', () => {
    it('should call console.error with the provided arguments', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      LoggingService.error(message, error);
      expect(console.error).toHaveBeenCalledWith(message, error);
    });
  });

  describe('warn method', () => {
    it('should call console.warn with the provided arguments', () => {
      const message = 'Test warning message';
      const data = { warningCode: 123 };
      LoggingService.warn(message, data);
      expect(console.warn).toHaveBeenCalledWith(message, data);
    });
  });

  describe('info method', () => {
    it('should call console.info with the provided arguments', () => {
      const message = 'Test info message';
      const data = { infoType: 'User Action' };
      LoggingService.info(message, data);
      expect(console.info).toHaveBeenCalledWith(message, data);
    });
  });

  describe('compatibility with createMockLoggingService', () => {
    it('should have the same interface as the mock', () => {
      const mockLoggingService = createMockLoggingService();

      expect(Object.keys(LoggingService)).toEqual(
        expect.arrayContaining(Object.keys(mockLoggingService))
      );

      Object.keys(mockLoggingService).forEach((key) => {
        expect(LoggingService).toHaveProperty(key);
        expect(typeof LoggingService[key as keyof typeof LoggingService]).toBe('function');
      });
    });
  });
});
