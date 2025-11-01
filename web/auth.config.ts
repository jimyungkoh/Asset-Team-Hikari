// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { backendApiService } from '@/lib/services/backend-api.service';

async function isEmailAllowed(email: string): Promise<boolean> {
  try {
    console.log(`[인증 시도] 이메일 검증 중: ${email}`);
    const result = await backendApiService.verifyEmail(email);

    if (!result.allowed) {
      console.warn(`[인증 거부] 이메일이 허용 목록에 없습니다: ${email}`);
    } else {
      console.log(`[인증 성공] 이메일 허용됨: ${email}`);
    }

    return result.allowed;
  } catch (error) {
    console.error('[인증 오류] 이메일 검증 요청 중 예외 발생:', {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    return false;
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        return false;
      }
      const normalizedEmail = user.email.toLowerCase();
      return isEmailAllowed(normalizedEmail);
    },
    async session({ session }) {
      if (!session?.user?.email) {
        return session;
      }
      session.user.email = session.user.email.toLowerCase();
      return session;
    },
  },
};
