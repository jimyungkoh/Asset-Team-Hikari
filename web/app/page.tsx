// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
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
      <div className="mb-12 animate-fade-in">
        <div className="space-y-6 max-w-3xl">
          <div className={surfaceClass("pill") + " w-fit"}>
            🚀 Asset Team Hikari
          </div>
          <h1 className={textStyles.heroTitle}>
            AI 분석 팀과 함께하는 투자 리서치
          </h1>
        </div>
      </div>

      {/* Asset Analysis Form */}
      <div className="animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className={surfaceClass("soft") + " p-8"}>
            <RunForm />
          </div>
        </div>
      </div>
    </>
  );
}