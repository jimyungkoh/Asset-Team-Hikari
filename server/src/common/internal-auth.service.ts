// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class InternalAuthService {
  private readonly expectedToken = process.env.INTERNAL_API_TOKEN;

  verify(token: string | undefined): void {
    // 개발 환경에서 토큰 인증을 스킵할 수 있는 옵션
    if (process.env.SKIP_TOKEN_AUTH === "true") {
      return;
    }

    if (!this.expectedToken) {
      throw new UnauthorizedException(
        "INTERNAL_API_TOKEN is not configured on the server"
      );
    }

    if (!token || token !== this.expectedToken) {
      throw new UnauthorizedException("Invalid internal authentication token");
    }
  }
}
