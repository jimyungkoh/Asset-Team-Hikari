// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

// ============================================================
// API Configuration
// ============================================================

export const API_CONFIG = {
  BASE_URL: process.env.SERVER_API_URL || '',
  INTERNAL_TOKEN: process.env.SERVER_INTERNAL_TOKEN || '',
  TIMEOUT: 30000, // 30 seconds
} as const;

// ============================================================
// Route Paths
// ============================================================

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/api/auth/signin',
  RUNS: {
    LIST: '/runs',
    DETAIL: (id: string) => `/runs/${id}`,
    STREAM: (id: string) => `/runs/${id}/stream`,
  },
  REPORTS: {
    LIST: '/reports',
    DETAIL: (id: string) => `/reports/${id}`,
  },
  TICKERS: {
    LIST: '/tickers',
    DETAIL: (ticker: string) => `/tickers/${ticker}`,
    DATE_DETAIL: (ticker: string, date: string) =>
      `/tickers/${ticker}/dates/${date}`,
    REPORTS: (ticker: string) => `/tickers/${ticker}/reports`,
  },
} as const;

// ============================================================
// HTTP Status Codes
// ============================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================
// Error Messages
// ============================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  INVALID_REQUEST: '잘못된 요청입니다.',
} as const;
