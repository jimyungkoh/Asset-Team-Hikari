// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { redirect } from "next/navigation";

import { PageShell } from "../components/design/page-shell";
import { Section } from "../components/design/section";
import { RunForm } from "../components/runs/run-form";
import { auth } from "../lib/auth";

export default async function HomePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null} showHero={true}>
      {/* Run Configuration Section */}
      <Section
        title="분석 설정 및 실행"
        description="분석할 자산과 기준일을 입력하고 즉시 실행합니다."
        icon="⚙️"
      >
        <RunForm />
      </Section>
    </PageShell>
  );
}
