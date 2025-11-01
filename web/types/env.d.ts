// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

declare namespace NodeJS {
  interface ProcessEnv {
    // Next.js
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;

    // NextAuth
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    // OAuth Providers
    GOOGLE_ID: string;
    GOOGLE_SECRET: string;
    GITHUB_ID: string;
    GITHUB_SECRET: string;

    // Backend API
    SERVER_API_URL: string;
    SERVER_INTERNAL_TOKEN: string;
  }
}
