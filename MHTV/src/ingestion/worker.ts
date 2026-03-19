import cron from "node-cron";
import { fileURLToPath } from "node:url";
import { appConfig } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { getProviders } from "./providers/index.js";
import { persistProviderResult } from "./upsert.js";

export async function runIngestionCycle() {
  const providers = getProviders();

  for (const provider of providers) {
    try {
      logger.info("Starting provider ingestion", { provider: provider.id });
      const result = await provider.ingest();
      await persistProviderResult(result);
      logger.info("Finished provider ingestion", {
        provider: provider.id,
        channels: result.channels.length,
        programmes: result.programmes.length
      });
    } catch (error) {
      logger.error("Provider ingestion failed", {
        provider: provider.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export function startIngestionScheduler() {
  cron.schedule(appConfig.ingestCron, async () => {
    await runIngestionCycle();
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runIngestionCycle().catch((error) => {
    logger.error("Fatal ingestion run failure", {
      error: error instanceof Error ? error.stack : String(error)
    });
    process.exitCode = 1;
  });
}
