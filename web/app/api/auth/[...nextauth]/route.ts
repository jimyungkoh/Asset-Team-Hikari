// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import NextAuth from 'next-auth';

import { authConfig } from '../../../../auth.config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
