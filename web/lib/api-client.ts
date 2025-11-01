// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from './constants';
import type { ApiError, ApiResponse } from '../types/api';

// ============================================================
// API Client Configuration
// ============================================================

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.defaultTimeout, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.handleErrorResponse(response);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      return this.handleError(error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<ApiResponse> {
    let errorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    switch (response.status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorMessage = ERROR_MESSAGES.INVALID_REQUEST;
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      case HTTP_STATUS.NOT_FOUND:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
    }

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    const error: ApiError = {
      code: `HTTP_${response.status}`,
      message: errorMessage,
    };

    return { success: false, error };
  }

  private handleError(error: unknown): ApiResponse {
    const apiError: ApiError = {
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
    };

    if (error instanceof Error) {
      apiError.message = error.message;
      apiError.details = { originalError: error.name };
    }

    return { success: false, error: apiError };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// ============================================================
// Export Singleton Instance
// ============================================================

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
