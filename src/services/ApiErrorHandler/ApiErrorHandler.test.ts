import { ApiErrorHandler } from './ApiErrorHandler';

// Mock console.error
console.error = jest.fn();

describe('ApiErrorHandler', () => {
  let apiErrorHandler: ApiErrorHandler;

  beforeEach(() => {
    apiErrorHandler = new ApiErrorHandler();
    jest.clearAllMocks(); // Clear mock calls between tests
  });

  it('should handle Axios error with response', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 404,
        data: 'Not Found',
      },
    };

    apiErrorHandler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('API Error:', 404, 'Not Found');
  });

  it('should handle Axios error with request but no response', () => {
    const error = {
      isAxiosError: true,
      request: {},
      response: undefined,
    };

    apiErrorHandler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('No response received:', {});
  });

  it('should handle Axios error without response or request', () => {
    const error = {
      isAxiosError: true,
      message: 'Network Error',
      request: undefined,
      response: undefined,
    };

    apiErrorHandler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('Error setting up request:', 'Network Error');
  });

  it('should handle non-Axios Error instance', () => {
    const error = new Error('Generic error');

    apiErrorHandler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('Unknown error:', 'Generic error');
  });

  it('should handle unknown error type', () => {
    const error = 'Some string error';

    apiErrorHandler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('Unknown error:', 'Some string error');
  });
});
