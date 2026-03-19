import { createApp } from "./server/app.js";
import { appConfig } from "./lib/config.js";
import { startIngestionScheduler } from "./ingestion/worker.js";
import { logger } from "./lib/logger.js";

const app = createApp();

app.listen(appConfig.port, () => {
  logger.info("MHTV server listening", { port: appConfig.port });
});

startIngestionScheduler();
