// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { config as loadEnv } from "dotenv";

import { AppModule } from "../src/app.module";
import { ReportsService } from "../src/reports/domain/reports.service";
import { ReportSummaryService } from "../src/reports/domain/report-summary.service";
import { ArtifactsService } from "../src/artifacts/infrastructure/artifacts.service";

loadEnv();

interface CliArgs {
  ticker: string;
  runDate: string;
  language?: string;
}

function parseArgs(argv: string[]): CliArgs | null {
  const filtered = argv.slice(2).filter((arg) => arg !== "--");
  const [tickerArg, dateArg, langArg] = filtered;

  if (!tickerArg || !dateArg) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: ts-node scripts/create-composite-report.ts <TICKER> <YYYY-MM-DD> [lang]",
    );
    return null;
  }

  const ticker = tickerArg.trim().toUpperCase();
  const runDate = dateArg.trim();
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(runDate)) {
    // eslint-disable-next-line no-console
    console.error("runDate must be in YYYY-MM-DD format.");
    return null;
  }

  const language = langArg?.trim();
  return { ticker, runDate, language };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (!args) {
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "error", "warn"],
  });

  const logger = new Logger("CreateCompositeReportScript");

  try {
    const reportsService = app.get(ReportsService);
    const reportSummaryService = app.get(ReportSummaryService);
    const artifactsService = app.get(ArtifactsService);

    const details = await reportsService.listDetailsByTickerAndDate(
      args.ticker,
      args.runDate,
    );

    if (details.length === 0) {
      logger.warn(
        `No report sections found for ${args.ticker} ${args.runDate}. Aborting.`,
      );
      process.exitCode = 1;
      return;
    }

    const sectionMap = new Map<string, string>();
    for (const detail of details) {
      sectionMap.set(detail.reportType, detail.content);
    }

    const language =
      args.language && args.language.length > 0
        ? args.language
        : reportSummaryService.getDefaultLanguage();

    const decision = sectionMap.get("decision") ?? null;
    const finalDecision = sectionMap.get("final_trade_decision") ?? null;

    const summary = await reportSummaryService.generateCompositeReport({
      ticker: args.ticker,
      runDate: args.runDate,
      language,
      decision,
      finalDecision,
      sections: {
        market: sectionMap.get("market") ?? null,
        sentiment: sectionMap.get("sentiment") ?? null,
        news: sectionMap.get("news") ?? null,
        fundamentals: sectionMap.get("fundamentals") ?? null,
        decision,
        final_trade_decision: finalDecision,
      },
    });

    if (!summary?.content) {
      logger.error(
        `Failed to generate composite report content for ${args.ticker} ${args.runDate}.`,
      );
      process.exitCode = 1;
      return;
    }

    const artifactKey = `reports#result#${summary.language}`;
    await artifactsService.saveArtifact({
      ticker: args.ticker,
      runDate: args.runDate,
      artifactNamespace: "reports",
      artifactKey,
      content: summary.content,
      contentSize: Buffer.byteLength(summary.content, "utf8"),
      contentType: "text/markdown",
      metadata: {
        summaryLanguage: summary.language,
        generatedAt: new Date().toISOString(),
        source: "manual-script",
      },
    });

    logger.log(
      `Composite report artifact ${artifactKey} stored for ${args.ticker} ${args.runDate}.`,
    );
  } finally {
    await app.close();
  }
}

void main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Composite report script failed:", error);
  process.exitCode = 1;
});
