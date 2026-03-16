import { Pool } from 'pg';

import { env } from './env';

function resolveSslConfig() {
  if (!env.DATABASE_URL) {
    return false;
  }

  if (env.PG_SSL_CA) {
    return {
      ca: env.PG_SSL_CA,
      rejectUnauthorized: env.PG_SSL_REJECT_UNAUTHORIZED ?? true,
    };
  }

  if (env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized: env.PG_SSL_REJECT_UNAUTHORIZED ?? true,
    };
  }

  return false;
}

// When env.DATABASE_URL points to managed providers, Pool TLS may require custom CA material
// or explicit certificate-policy override; default remains strict in production via env.NODE_ENV.
export const pgPool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      ssl: resolveSslConfig(),
    })
  : null;
