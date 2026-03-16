"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const postgres_1 = require("./config/postgres");
const logger_1 = require("./utils/logger");
const server = app_1.app.listen(env_1.env.PORT, () => {
    logger_1.logger.info({ port: env_1.env.PORT, env: env_1.env.NODE_ENV }, 'TradeFlow API server started');
});
async function shutdown(signal) {
    logger_1.logger.info({ signal }, 'Shutdown signal received');
    server.close(async () => {
        if (postgres_1.pgPool) {
            await postgres_1.pgPool.end();
        }
        logger_1.logger.info('TradeFlow API server stopped');
        process.exit(0);
    });
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
//# sourceMappingURL=server.js.map