// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { redirect } from "next/navigation";

import { Section } from "../components/design/section";
import { RunForm } from "../components/runs/run-form";
import { auth } from "../lib/auth";
import { surfaceClass, textStyles } from "../lib/design-system";

export default async function HomePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <>
      {/* Hero Section */}
      <div className="mb-20 animate-fade-in">
        <div className="space-y-6 max-w-3xl">
          <div className={surfaceClass("pill") + " w-fit"}>
            🚀 Asset Team Hikari
          </div>
          <h1 className={textStyles.heroTitle}>
            AI 분석 팀과 함께하는 투자 리서치
          </h1>
        </div>
      </div>

      {/* Run Configuration Section */}
      <Section
        title="분석 설정 및 실행"
        description="분석할 자산과 기준일을 입력하고 즉시 실행합니다."
        icon="⚙️"
      >
        <RunForm />
      </Section>
    </>
  );
}
