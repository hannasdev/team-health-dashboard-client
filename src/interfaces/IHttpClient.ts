export interface IHttpClient {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(url: string, data?: Record<string, unknown>): Promise<T>;
  put<T>(url: string, data?: Record<string, unknown>): Promise<T>;
  delete<T>(url: string): Promise<T>;
}
