// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { getServerSession } from 'next-auth';

import { authConfig } from '../auth.config';

export const auth = () => getServerSession(authConfig);
