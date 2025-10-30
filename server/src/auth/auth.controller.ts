// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Body, Controller, Headers, Post } from "@nestjs/common";

import { InternalAuthService } from "../common/internal-auth.service";
import { AuthService } from "./auth.service";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly internalAuthService: InternalAuthService
  ) {}

  @Post("verify-email")
  async verifyEmail(
    @Headers("x-internal-token") token: string | undefined,
    @Body() body: VerifyEmailDto
  ): Promise<{ allowed: boolean }> {
    this.internalAuthService.verify(token);
    const allowed = await this.authService.isEmailAllowed(body.email);
    return { allowed };
  }
}
