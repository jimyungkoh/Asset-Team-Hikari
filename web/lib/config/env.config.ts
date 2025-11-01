// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

// ============================================================
// Environment Configuration
// ============================================================

interface EnvConfig {
  nodeEnv: string;
  nextAuth: {
    url: string;
    secret: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
    github: {
      clientId: string;
      clientSecret: string;
    };
  };
  backend: {
    apiUrl: string;
    internalToken: string;
    skipTokenAuth: boolean;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue = ''): string {
  return process.env[key] ?? defaultValue;
}

export const envConfig: EnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  nextAuth: {
    url: getEnvVar('NEXTAUTH_URL'),
    secret: getEnvVar('NEXTAUTH_SECRET'),
  },
  oauth: {
    google: {
      clientId: getEnvVar('GOOGLE_ID'),
      clientSecret: getEnvVar('GOOGLE_SECRET'),
    },
    github: {
      clientId: getEnvVar('GITHUB_ID'),
      clientSecret: getEnvVar('GITHUB_SECRET'),
    },
  },
  backend: {
    apiUrl: getOptionalEnvVar('NEST_API_BASE', 'http://localhost:3001'),
    internalToken: getOptionalEnvVar('INTERNAL_API_TOKEN'),
    skipTokenAuth: getOptionalEnvVar('SKIP_TOKEN_AUTH') === 'true',
  },
};

export const isDevelopment = envConfig.nodeEnv === 'development';
export const isProduction = envConfig.nodeEnv === 'production';
export const isTest = envConfig.nodeEnv === 'test';
