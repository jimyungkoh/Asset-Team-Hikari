// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type {
  Run,
  EmailVerificationResponse,
  ReportDetail,
} from '@/types/api';

// ============================================================
// Error Type
// ============================================================

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

// ============================================================
// Backend API Service
// ============================================================

interface BackendApiConfig {
  baseUrl: string;
  internalToken?: string;
  skipTokenAuth?: boolean;
}

class BackendApiService {
  private config: BackendApiConfig;

  constructor() {
    this.config = {
      baseUrl: this.getNormalizedBaseUrl(),
      internalToken: process.env.INTERNAL_API_TOKEN,
      skipTokenAuth: process.env.SKIP_TOKEN_AUTH === 'true',
    };
  }

  private getNormalizedBaseUrl(): string {
    const base = process.env.NEST_API_BASE ?? 'http://localhost:3001';
    return base.replace(/\/$/, '');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText || 'API Error';
      let payload: unknown = undefined;

      if (errorText) {
        try {
          payload = JSON.parse(errorText);
          if (
            payload &&
            typeof payload === 'object' &&
            'message' in payload &&
            typeof (payload as Record<string, unknown>).message === 'string'
          ) {
            errorMessage = (payload as Record<string, string>).message;
          } else {
            errorMessage = errorText;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new BackendApiError(errorMessage, response.status, payload);
    }

    return response.json();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.internalToken) {
      headers['X-Internal-Token'] = this.config.internalToken;
    }

    return headers;
  }

  private validateConfig(): void {
    if (!this.config.internalToken && !this.config.skipTokenAuth) {
      throw new Error('INTERNAL_API_TOKEN is not configured');
    }
  }

  async getRun(id: string): Promise<Run> {
    this.validateConfig();

    const response = await fetch(`${this.config.baseUrl}/runs/${id}`, {
      headers: this.getHeaders(),
      cache: 'no-store',
    });

    return this.handleResponse<Run>(response);
  }

  async createRun(body: unknown): Promise<Run> {
    this.validateConfig();

    const response = await fetch(`${this.config.baseUrl}/runs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    return this.handleResponse<Run>(response);
  }

  async verifyEmail(email: string): Promise<EmailVerificationResponse> {
    this.validateConfig();

    const response = await fetch(`${this.config.baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    return this.handleResponse<EmailVerificationResponse>(response);
  }

  async getReportsByTickerAndDate(
    ticker: string,
    runDate: string,
  ): Promise<ReportDetail[]> {
    this.validateConfig();

    const response = await fetch(
      `${this.config.baseUrl}/reports/tickers/${encodeURIComponent(
        ticker,
      )}/dates/${encodeURIComponent(runDate)}`,
      {
        headers: this.getHeaders(),
        cache: 'no-store',
      },
    );

    const { reports } = await this.handleResponse<{ reports: ReportDetail[] }>(
      response,
    );
    return reports;
  }

  async searchTickers(query: string): Promise<string[]> {
    this.validateConfig();

    const url = new URL(`${this.config.baseUrl}/tickers/search`);
    url.searchParams.set('query', query);

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
      cache: 'no-store',
    });

    const { tickers } = await this.handleResponse<{ tickers: string[] }>(
      response,
    );
    return tickers;
  }
}

// ============================================================
// Export Singleton Instance
// ============================================================

export const backendApiService = new BackendApiService();
