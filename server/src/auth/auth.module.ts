// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { InternalAuthService } from "../common/internal-auth.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [InfrastructureModule],
  controllers: [AuthController],
  providers: [AuthService, InternalAuthService],
  exports: [AuthService],
})
export class AuthModule {}
