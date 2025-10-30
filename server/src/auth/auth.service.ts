// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

import { DatabaseService } from "../infrastructure/database/database.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async isEmailAllowed(email: string): Promise<boolean> {
    if (!this.databaseService.isEnabled) {
      this.logger.error(
        "Supabase 데이터베이스가 설정되지 않아 인증을 처리할 수 없습니다."
      );
      throw new ServiceUnavailableException(
        "Authentication directory is not configured"
      );
    }

    return this.databaseService.isEmailAllowed(email);
  }
}
