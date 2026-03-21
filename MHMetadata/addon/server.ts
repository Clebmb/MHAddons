import 'dotenv/config';
import consola from 'consola';

const PORT: number = parseInt(process.env.PORT || '3232', 10);

function applyDefaultEnvironment(): void {
  if (!process.env.HOST_NAME) {
    process.env.HOST_NAME = `http://127.0.0.1:${PORT}`;
  }

  if (!process.env.DATABASE_URI) {
    process.env.DATABASE_URI = 'sqlite://addon/data/db.sqlite';
  }

  if (!process.env.REDIS_URL && process.env.NO_CACHE === undefined) {
    process.env.NO_CACHE = 'true';
  }
}
 
async function startServer(): Promise<void> {
  applyDefaultEnvironment();

  // Initialize modules only after env defaults are in place.
  await import('./utils/httpClient.js');
  const [{ startServerWithCacheWarming, getDashboardAPI }, { initializeMapper }, { initializeAnimeListMapper }, { initializeMappings }, { initializeRatings }, { runCacheCleanup }, { runCachePathMigration }, { performVersionCleanup }, databaseModule] = await Promise.all([
    import('./index.js'),
    import('./lib/id-mapper.js'),
    import('./lib/anime-list-mapper.js'),
    import('./lib/wiki-mapper.js'),
    import('./lib/imdbRatings.js'),
    import('./cache-cleanup.js'),
    import('./lib/cache-path-migration.js'),
    import('./lib/versionCleanup.js'),
    import('./lib/database.js'),
  ]);
  const database = databaseModule.default;

  consola.info('--- Addon Starting Up ---');
 
  process.on('uncaughtException', (error: Error) => {
    consola.error('--- UNCAUGHT EXCEPTION ---');
    consola.error('Error:', error.message);
    consola.error('Stack:', error.stack);
    consola.error('This error was not caught and could crash the application.');
  });
  
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    consola.error('--- UNHANDLED PROMISE REJECTION ---');
    consola.error('Reason:', reason);
    consola.error('Promise:', promise);
    consola.error('This rejection was not handled and could crash the application.');
  });
 
  // Database must initialize first
  consola.info('Initializing Database...');
  await database.initialize();
  consola.success('Database initialization complete.');

  const redisModule = await import('./lib/redisClient.js');
  const redis: any = redisModule.default ?? redisModule;
  if (redis && redis.status === 'end') {
    consola.info('Connecting Redis...');
    await redis.connect();
    consola.success('Redis connected.');
  }
  
  // Cache path migration
  consola.info('Running cache path migration...');
  await runCachePathMigration();
  consola.success('Cache path migration complete.');
  
  consola.info('Initializing Mappers, Ratings, and Cache Cleanup...');

  performVersionCleanup().catch((error: any) => {
    consola.error('Background version cleanup failed:', error.message);
  });
  
  const initializationTasks = [
    {
      name: 'ID Mapper (anime-list.json)',
      task: async () => {
        consola.info('Initializing ID Mapper...');
        await initializeMapper();
      },
      critical: true
    },
    {
      name: 'Anime List Mapper (anime-list.xml)',
      task: async () => {
        consola.info('Initializing Anime List Mapper...');
        await initializeAnimeListMapper();
      },
      critical: true
    },
    {
      name: 'Wiki Mappings',
      task: async () => {
        consola.info('Initializing Wiki Mappings...');
        await initializeMappings();
      },
      critical: true
    },
    {
      name: 'IMDb Ratings',
      task: async () => {
        consola.info('Initializing IMDb Ratings...');
        await initializeRatings();
      },
      critical: true
    },
    {
      name: 'Cache Cleanup Check',
      task: async () => {
        consola.info('Checking for one-time cache cleanup...');
        await runCacheCleanup();
      },
      critical: false
    }
  ];
  
  // Execute all tasks in parallel
  const results = await Promise.allSettled(
    initializationTasks.map(({ task }) => task())
  );
  
  // Check results and log appropriately
  const failures: string[] = [];
  results.forEach((result, index) => {
    const { name, critical } = initializationTasks[index];
    if (result.status === 'fulfilled') {
      consola.success(`${name} initialization complete.`);
    } else {
      consola.error(`${name} failed to initialize:`, result.reason);
      if (critical) {
        failures.push(name);
      }
    }
  });
  
  // Abort startup if any critical tasks failed
  if (failures.length > 0) {
    throw new Error(`Critical initialization failures: ${failures.join(', ')}`);
  }
  
  consola.success('All initializations complete.');
  
  // PHASE 3: Start server with cache warming
  consola.info('Starting server with cache warming...');
  const addon: any = await startServerWithCacheWarming();
  
  // PHASE 4: Start background catalog warming (after server initialization)
  const { startMALWarmup } = await import('./lib/malCatalogWarmer.js');
  startMALWarmup();
  
  const { startComprehensiveCatalogWarming } = await import('./lib/comprehensiveCatalogWarmer.js');
  startComprehensiveCatalogWarming();
  
  // PHASE 5: Start cache cleanup scheduler
  consola.info('Starting cache cleanup scheduler...');
  const { startCacheCleanupScheduler } = await import('./lib/cacheCleanupScheduler.js');
  const dashboardApi = getDashboardAPI();
  startCacheCleanupScheduler(dashboardApi);
  
  addon.listen(PORT, () => {
    consola.success(`Addon active and listening on port ${PORT}.`);
    consola.info(`Open http://127.0.0.1:${PORT} in your browser.`);
  });
}
 
startServer().catch((error: Error) => {
  consola.error('--- FATAL STARTUP ERROR ---');
  consola.error(error);
  process.exit(1);
});
