"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgPool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
function resolveSslConfig() {
    if (!env_1.env.DATABASE_URL) {
        return false;
    }
    if (env_1.env.PG_SSL_CA) {
        return {
            ca: env_1.env.PG_SSL_CA,
            rejectUnauthorized: env_1.env.PG_SSL_REJECT_UNAUTHORIZED ?? true,
        };
    }
    if (env_1.env.NODE_ENV === 'production') {
        return {
            rejectUnauthorized: env_1.env.PG_SSL_REJECT_UNAUTHORIZED ?? true,
        };
    }
    return false;
}
// When env.DATABASE_URL points to managed providers, Pool TLS may require custom CA material
// or explicit certificate-policy override; default remains strict in production via env.NODE_ENV.
exports.pgPool = env_1.env.DATABASE_URL
    ? new pg_1.Pool({
        connectionString: env_1.env.DATABASE_URL,
        ssl: resolveSslConfig(),
    })
    : null;
//# sourceMappingURL=postgres.js.map