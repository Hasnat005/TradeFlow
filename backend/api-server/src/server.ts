import { app } from './app';
import { env } from './config/env';
import { pgPool } from './config/postgres';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'TradeFlow API server started');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(async () => {
    if (pgPool) {
      await pgPool.end();
    }
    logger.info('TradeFlow API server stopped');
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
