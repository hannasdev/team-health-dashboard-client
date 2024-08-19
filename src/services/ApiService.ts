import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { IApiClient, ITokenManager, IApiErrorHandler } from '../interfaces';

export class ApiService implements IApiClient {
  protected readonly api: AxiosInstance;
  private readonly errorHandler: IApiErrorHandler;
  private readonly tokenManager: ITokenManager;

  constructor(baseURL: string, errorHandler: IApiErrorHandler, tokenManager: ITokenManager) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.errorHandler = errorHandler;
    this.tokenManager = tokenManager;

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      this.handleRequestInterceptor.bind(this),
      (error: AxiosError) =>
        Promise.reject(error instanceof Error ? error : new Error(String(error)))
    );

    this.api.interceptors.response.use(
      (response) => response,
      this.handleResponseInterceptor.bind(this)
    );
  }

  private handleRequestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = this.tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private async handleResponseInterceptor(error: AxiosError): Promise<AxiosResponse> {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // This block is executed when there's a 401 error
      originalRequest._retry = true; // Prevent infinite recursion if refresh fails

      try {
        // Attempt to refresh the token
        const newToken = await this.tokenManager.refreshToken();

        //  Important: Update the token in the Authorization header
        if (newToken) {
          // Check if refreshToken actually returned a token
          this.tokenManager.setToken(newToken);
          // Assuming your tokenManager.setToken() updates localStorage

          // Set the Authorization header with the new token for the retried request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return await this.api(originalRequest);
        } else {
          // Handle the case where refreshToken didn't return a new token
          // This could mean the user needs to re-login.
          this.errorHandler.handleError(new Error('Token refresh failed'));
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        this.errorHandler.handleError(refreshError);
        throw refreshError;
      }
    } else {
      // For all other errors, handle them with the errorHandler
      this.errorHandler.handleError(error);
      return Promise.reject(error); // Reject the original promise for other errors
    }
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put<T>(url, data);
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete<T>(url);
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }
}
