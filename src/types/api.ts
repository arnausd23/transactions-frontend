/**
 * API request options
 */
export interface FetchAPIOptions {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * API response wrapper
 */
export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

