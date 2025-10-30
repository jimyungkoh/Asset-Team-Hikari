// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { IsEmail } from "class-validator";

export class VerifyEmailDto {
  @IsEmail()
  readonly email!: string;
}
