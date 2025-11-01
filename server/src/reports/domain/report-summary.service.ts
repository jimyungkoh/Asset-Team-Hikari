// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";

import { OpenRouterAiClient } from "../../infrastructure/ai/openrouter-ai.client";
import { stringifyStructuredContent } from "../../common/utils/content-normalizer";

export interface ReportSummaryInput {
  ticker: string;
  runDate: string;
  language?: string;
  decision?: string | null;
  finalDecision?: string | null;
  sections: Record<string, string | null | undefined>;
}

export interface ReportSummaryResult {
  content: string;
  language: string;
}

@Injectable()
export class ReportSummaryService {
  private readonly logger = new Logger(ReportSummaryService.name);
  private readonly defaultLanguage =
    process.env.REPORT_SUMMARY_DEFAULT_LANG ?? "ko";

  constructor(private readonly openRouter: OpenRouterAiClient) {}

  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  async generateCompositeReport(
    input: ReportSummaryInput,
  ): Promise<ReportSummaryResult | null> {
    if (!this.openRouter.isConfigured) {
      this.logger.warn(
        "OpenRouter API key is not configured; skipping composite report generation.",
      );
      return null;
    }

    const language = input.language?.trim() || this.defaultLanguage;
    const normalizedSections = this.normalizeSections(input.sections);

    if (normalizedSections.length === 0) {
      this.logger.warn(
        `No report sections available for ${input.ticker} ${input.runDate}; skipping composite report generation.`,
      );
      return null;
    }

    const decisionText = stringifyStructuredContent(input.decision ?? "", "\n\n").trim();
    const finalDecisionText = stringifyStructuredContent(
      input.finalDecision ?? "",
      "\n\n",
    ).trim();

    const systemMessage = this.buildSystemPrompt(language);
    const userMessage = this.buildUserPrompt({
      ticker: input.ticker,
      runDate: input.runDate,
      language,
      sections: normalizedSections,
      decision: decisionText,
      finalDecision: finalDecisionText,
    });

    try {
      const content = await this.openRouter.createChatCompletion(
        [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        {
          temperature: 0.1,
          enableReasoning: false,
        },
      );

      return {
        content,
        language,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate composite report for ${input.ticker} ${input.runDate}`,
        error as Error,
      );
      return null;
    }
  }

  private normalizeSections(
    sections: Record<string, string | null | undefined>,
  ): Array<{ key: string; title: string; content: string }> {
    const entries: Array<{ key: string; title: string; content: string }> = [];

    for (const [key, rawContent] of Object.entries(sections)) {
      const content = stringifyStructuredContent(rawContent ?? "", "\n\n").trim();
      if (!content) {
        continue;
      }
      entries.push({
        key,
        title: this.formatSectionTitle(key),
        content,
      });
    }

    return entries;
  }

  private formatSectionTitle(key: string): string {
    const mapping: Record<string, string> = {
      decision: "투자 의사결정 요약",
      final_trade_decision: "최종 포트폴리오 판단",
      market: "시장 분석",
      market_report: "시장 분석",
      sentiment: "투자 심리 분석",
      sentiment_report: "투자 심리 분석",
      news: "뉴스 인사이트",
      news_report: "뉴스 인사이트",
      fundamentals: "기본적 분석",
      fundamentals_report: "기본적 분석",
    };

    if (mapping[key]) {
      return mapping[key];
    }

    return key
      .replace(/[_\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  private buildSystemPrompt(language: string): string {
    const languageLabel = this.describeLanguage(language);
    return [
      `You are a senior securities analyst at a top-tier investment bank.`,
      `Your role is to synthesize provided analysis notes into a professional, client-ready research report in ${languageLabel}.`,
      `Strict requirements:`,
      `- Do not fabricate or alter facts beyond the supplied material.`,
      `- Organize information logically with clear section headings and concise bullet points where appropriate.`,
      `- Maintain a formal yet readable tone consistent with equity research publications.`,
      `- Highlight actionable insights, risks, catalysts, and valuation context when the source material allows.`,
    ].join(" ");
  }

  private buildUserPrompt(params: {
    ticker: string;
    runDate: string;
    language: string;
    sections: Array<{ key: string; title: string; content: string }>;
    decision?: string;
    finalDecision?: string;
  }): string {
    const lines: string[] = [];
    lines.push(`티커: ${params.ticker}`);
    lines.push(`거래일: ${params.runDate}`);
    lines.push("");
    lines.push(
      "아래 자료를 바탕으로, 증권사 리서치 센터가 발행하는 전문 리포트 형식의 종합 보고서를 작성하세요.",
    );
    lines.push("주요 목적은 사용자가 빠르게 핵심을 파악하고 실무에 활용할 수 있도록 돕는 것입니다.");
    lines.push("내용 왜곡은 절대 금지합니다. 제공된 정보 이외의 추측이나 가정은 명시적으로 표시하지 말고 작성하지 마세요.");
    lines.push("");

    if (params.decision) {
      lines.push("■ 투자 의사결정 개요");
      lines.push(params.decision);
      lines.push("");
    }
    if (params.finalDecision) {
      lines.push("■ 최종 포트폴리오 판단");
      lines.push(params.finalDecision);
      lines.push("");
    }

    lines.push("■ 세부 분석 자료");
    for (const section of params.sections) {
      lines.push(`### ${section.title}`);
      lines.push(section.content);
      lines.push("");
    }

    lines.push("작성 지침:");
    lines.push("- 서론, 본론(시장/심리/뉴스/기본적), 투자 전략, 리스크 요인, 결론 순으로 구조화합니다.");
    lines.push(
      "- 표나 목록이 필요할 경우 마크다운을 사용하되, 텍스트 중심으로 깔끔하게 정리하세요.",
    );
    lines.push("- 핵심 지표나 수치를 재언급할 때는 원문과 동일하게 유지합니다.");
    lines.push("- 모든 문장은 지정된 언어로 작성합니다.");

    return lines.join("\n");
  }

  private describeLanguage(language: string): string {
    const lower = language.trim().toLowerCase();
    switch (lower) {
      case "ko":
      case "kr":
      case "korean":
        return "Korean";
      case "en":
      case "english":
        return "English";
      case "ja":
        return "Japanese";
      case "zh":
        return "Chinese";
      default:
        return language;
    }
  }
}
