// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const serverApiUrl = process.env.SERVER_API_URL;
const internalApiToken = process.env.SERVER_INTERNAL_TOKEN;

const verifyEmailUrl =
  serverApiUrl !== undefined && serverApiUrl.length > 0
    ? new URL('/auth/verify-email', serverApiUrl).toString()
    : null;

async function isEmailAllowed(email: string): Promise<boolean> {
  if (!verifyEmailUrl || !internalApiToken) {
    console.error(
      'SERVER_API_URL 또는 SERVER_INTERNAL_TOKEN 환경 변수가 설정되지 않았습니다.',
    );
    return false;
  }

  try {
    const response = await fetch(verifyEmailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': internalApiToken,
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        `이메일 검증 요청이 실패했습니다. status=${response.status}`,
      );
      return false;
    }

    const payload = (await response.json()) as { allowed?: boolean };
    return Boolean(payload.allowed);
  } catch (error) {
    console.error('이메일 검증 요청 중 오류가 발생했습니다.', error);
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
