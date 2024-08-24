import type { IApiClient, ITokenManager, IApiErrorHandler } from '../../interfaces';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  __isRetry?: boolean;
}

export class ApiService implements IApiClient {
  constructor(
    private readonly axiosInstance: AxiosInstance,
    private readonly tokenManager: ITokenManager,
    private readonly errorHandler: IApiErrorHandler
  ) {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(this.handleRequestInterceptor.bind(this), (error) =>
      Promise.reject(error instanceof Error ? error : new Error(String(error)))
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      this.handleResponseInterceptor.bind(this)
    );
  }

  private handleRequestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = this.tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private async handleResponseInterceptor(error: unknown): Promise<any> {
    const axiosError = error as AxiosError;
    const config = axiosError.config as RetryableRequestConfig;

    if (axiosError.response?.status === 401 && !config.__isRetry) {
      config.__isRetry = true;
      try {
        await this.tokenManager.refreshToken();
        return await this.axiosInstance(config);
      } catch (refreshError) {
        this.errorHandler.handleError(refreshError);
        throw refreshError instanceof Error ? refreshError : new Error(String(refreshError));
      }
    }

    this.errorHandler.handleError(error);
    throw error instanceof Error ? error : new Error(String(error));
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data);
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  public async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, { data: config });
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }
}
