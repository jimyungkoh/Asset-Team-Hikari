// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const serverApiUrl = process.env.SERVER_API_URL;
const internalApiToken = process.env.SERVER_INTERNAL_TOKEN;

const verifyEmailUrl =
  serverApiUrl !== undefined && serverApiUrl.length > 0
    ? new URL("/auth/verify-email", serverApiUrl).toString()
    : null;

async function isEmailAllowed(email: string): Promise<boolean> {
  if (!verifyEmailUrl || !internalApiToken) {
    console.error("[인증 실패] 환경 변수 미설정:", {
      hasServerApiUrl: !!verifyEmailUrl,
      hasInternalToken: !!internalApiToken,
      serverApiUrl: serverApiUrl || "미설정",
    });
    return false;
  }

  try {
    console.log(`[인증 시도] 이메일 검증 중: ${email}`);
    const response = await fetch(verifyEmailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": internalApiToken,
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }

      console.error(`[인증 실패] 이메일 검증 요청 실패:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        email,
      });
      return false;
    }

    const payload = (await response.json()) as { allowed?: boolean };
    const allowed = Boolean(payload.allowed);

    if (!allowed) {
      console.warn(`[인증 거부] 이메일이 허용 목록에 없습니다: ${email}`);
    } else {
      console.log(`[인증 성공] 이메일 허용됨: ${email}`);
    }

    return allowed;
  } catch (error) {
    console.error("[인증 오류] 이메일 검증 요청 중 예외 발생:", {
      error: error instanceof Error ? error.message : String(error),
      email,
      verifyEmailUrl,
    });
    return false;
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
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
