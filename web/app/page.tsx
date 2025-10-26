// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { redirect } from "next/navigation";

import { MetricGrid } from "../components/design/metric-card";
import { PageShell } from "../components/design/page-shell";
import { Section } from "../components/design/section";
import { RunForm } from "../components/runs/run-form";
import { auth } from "../lib/auth";
import {
  FINANCE_METRICS,
  KNOWLEDGE_CARDS,
  PIPELINE_STEPS,
  layoutStyles,
  surfaceClass,
} from "../lib/design-system";

export default async function HomePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null}>
      {/* Metrics Section */}
      <Section
        title="실시간 지표"
        description="다중 에이전트 워크플로우의 핵심 성능 메트릭을 한눈에 확인하세요."
        icon="📊"
      >
        <MetricGrid metrics={FINANCE_METRICS} />
      </Section>

      {/* Run Configuration Section */}
      <Section
        title="런 구성 및 실행"
        description="분석할 자산, 모델 스택, 연구 심도를 선택하고 즉시 실행합니다."
        icon="⚙️"
      >
        <RunForm />
      </Section>

      {/* Workflow Pipeline Section */}
      <Section
        title="실행 파이프라인"
        description="TradingAgents가 의사결정을 내리는 4단계 프로세스"
        icon="🔄"
        variant="soft"
      >
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {PIPELINE_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={
                surfaceClass("glass") +
                " relative group overflow-hidden p-6 transition-all hover:shadow-lg"
              }
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors" />

              {/* Content */}
              <div className="relative space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {step.icon && <span className="mr-2">{step.icon}</span>}
                      {step.label}
                    </h3>
                    {step.emphasis && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-1">
                        {step.emphasis}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Knowledge & Features Section */}
      <Section
        title="설계 원칙"
        description="체계적이고 투명한 구성을 위한 핵심 철학"
        icon="💡"
        variant="outline"
      >
        <div className={layoutStyles.cardGrid}>
          {KNOWLEDGE_CARDS.map((card) => (
            <article
              key={card.title}
              className={
                surfaceClass("glass") +
                " group relative overflow-hidden p-7 transition-all hover:shadow-xl cursor-pointer"
              }
            >
              {/* Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {card.caption}
                  </span>
                  {card.icon && (
                    <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                      {card.icon}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Tips Section */}
      <Section
        title="실행 전 참고사항"
        description="런 구성을 최대한 활용하기 위한 팁"
        icon="📝"
      >
        <div className="space-y-4">
          {[
            {
              icon: "🎯",
              title: "연구 심도",
              description:
                "선택한 심도는 토론 라운드(`max_debate_rounds`, `max_risk_discuss_rounds`)에 그대로 반영됩니다.",
            },
            {
              icon: "🔌",
              title: "LLM 프로바이더",
              description:
                "프로바이더 선택과 모델 조합은 TradingAgents runner config로 즉시 전달되어 실행 환경에 적용됩니다.",
            },
            {
              icon: "💾",
              title: "메타데이터 저장",
              description:
                "모든 런은 DB 영속화를 대비한 `metadata` 블록을 포함하며, 선택값을 그대로 기록합니다.",
            },
            {
              icon: "⚡",
              title: "실시간 모니터링",
              description:
                "런 실행 후 `/runs/<id>` 페이지에서 실시간 로그와 최종 리포트를 확인할 수 있습니다.",
            },
          ].map((tip, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-lg bg-white/40 backdrop-blur border border-white/30 hover:bg-white/60 transition-colors"
            >
              <div className="text-2xl flex-shrink-0">{tip.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{tip.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
