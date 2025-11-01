// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { InternalAuthService } from '../internal-auth.service';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly authService: InternalAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-internal-token'];
    
    this.authService.verify(token);
    return true;
  }
}
