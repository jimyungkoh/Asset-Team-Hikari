// // ============================================================
// // Modified: See CHANGELOG.md for complete modification history
// // Last Updated: 2025-11-01
// // Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// // ============================================================
//
// import { Logger } from "@nestjs/common";
// import { NestFactory } from "@nestjs/core";
// import { config as loadEnv } from "dotenv";
//
// import { AppModule } from "../src/app.module";
// import { RunsService } from "../src/runs/runs.service";
//
// loadEnv();
//
// async function main(): Promise<void> {
//   const args = process.argv.slice(2).filter((arg) => arg !== "--");
//   const runId = args[0] ?? process.env.RUN_ID;
//   if (!runId) {
//     // eslint-disable-next-line no-console
//     console.error("Usage: ts-node scripts/backfill-run.ts <runId>");
//     process.exitCode = 1;
//     return;
//   }
//
//   const app = await NestFactory.createApplicationContext(AppModule, {
//     logger: ["log", "error", "warn"],
//   });
//
//   try {
//     const runsService = app.get(RunsService);
//     const logger = new Logger("BackfillRunScript");
//
//     logger.log(`Backfilling run artifacts for ${runId}...`);
//     await runsService.backfillRun(runId);
//     logger.log(`Run ${runId} artifacts persisted successfully.`);
//   } finally {
//     await app.close();
//   }
// }
//
// void main().catch((error) => {
//   // eslint-disable-next-line no-console
//   console.error("Backfill script failed:", error);
//   process.exitCode = 1;
// });
