// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { Run, EmailVerificationResponse } from '@/types/api';

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
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }

      throw new Error(`API Error (${response.status}): ${errorMessage}`);
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
}

// ============================================================
// Export Singleton Instance
// ============================================================

export const backendApiService = new BackendApiService();
