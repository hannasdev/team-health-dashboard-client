import axios from 'axios';
import type { IApiErrorHandler } from '../interfaces';

export class ApiErrorHandler implements IApiErrorHandler {
  public handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    } else if (error instanceof Error) {
      console.error('Unknown error:', error.message);
    } else {
      console.error('Unknown error:', String(error));
    }
  }
}
