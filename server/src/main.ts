// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadEnv } from 'dotenv';

import { AppModule } from './app.module';

loadEnv();

function parseOrigins(raw: string | undefined): (string | RegExp)[] | undefined {
  if (!raw) {
    return undefined;
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((origin) => {
      if (origin.startsWith('/') && origin.endsWith('/')) {
        const pattern = origin.slice(1, -1);
        return new RegExp(pattern);
      }
      return origin;
    });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const corsOrigins = parseOrigins(process.env.NEST_CORS_ORIGINS);
  app.enableCors(
    corsOrigins
      ? {
          origin: corsOrigins,
          credentials: true,
        }
      : {
          origin: true,
          credentials: true,
        },
  );

  const port = Number(process.env.NEST_PORT ?? process.env.PORT ?? 3001);

  await app.listen(port);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('NestJS bootstrap failed', error);
  process.exit(1);
});
