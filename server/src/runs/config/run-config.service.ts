// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class RunConfigService {
  private readonly logger = new Logger(RunConfigService.name);
  private readonly templateCache: Record<string, unknown>;

  constructor() {
    this.templateCache = this.loadTemplate();
  }

  /**
   * 기본 런 템플릿을 로드합니다.
   */
  private loadTemplate(): Record<string, unknown> {
    try {
      const templatePath = join(process.cwd(), 'config', 'run-template.json');
      const content = readFileSync(templatePath, 'utf-8');
      const parsed = JSON.parse(content) as Record<string, unknown>;

      // _metadata 필드 제거
      const { _metadata, ...template } = parsed;

      this.logger.log('Run template loaded successfully');
      return template;
    } catch (error) {
      this.logger.error('Failed to load run template, using empty config', error as Error);
      return {};
    }
  }

  /**
   * 템플릿과 사용자 입력을 병합하여 최종 config를 생성합니다.
   * @param ticker 티커 심볼
   * @param tradeDate 거래 날짜
   * @param userConfig 사용자 정의 config (선택)
   */
  buildRunConfig(
    ticker: string,
    tradeDate: string,
    userConfig?: Record<string, unknown>,
  ): Record<string, unknown> {
    const config = {
      ...this.templateCache,
      ...userConfig,
    };

    // metadata.preparedAt 주입
    if (config.metadata && typeof config.metadata === 'object') {
      (config.metadata as Record<string, unknown>).preparedAt = new Date().toISOString();
    }

    return config;
  }

  /**
   * 현재 템플릿을 반환합니다 (읽기 전용).
   */
  getTemplate(): Readonly<Record<string, unknown>> {
    return { ...this.templateCache };
  }
}
