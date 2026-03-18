import { Pool } from 'pg';

import { env } from './env';

function resolveSslConfig() {
  if (!env.DATABASE_URL) {
    return false;
  }

  const isSupabaseDatabase = env.DATABASE_URL.includes('.supabase.co');
  const rejectUnauthorized = env.PG_SSL_REJECT_UNAUTHORIZED ?? (env.NODE_ENV === 'production');

  if (env.PG_SSL_CA) {
    return {
      ca: env.PG_SSL_CA,
      rejectUnauthorized,
    };
  }

  if (isSupabaseDatabase) {
    return {
      rejectUnauthorized,
    };
  }

  if (env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized,
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
