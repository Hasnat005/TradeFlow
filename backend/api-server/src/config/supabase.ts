import { createClient } from '@supabase/supabase-js';

import { env } from './env';

const canInitSupabase = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

export const isSupabaseConfigured = canInitSupabase;

export const supabaseAdmin = canInitSupabase
  ? createClient(env.SUPABASE_URL as string, env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: env.SUPABASE_DB_SCHEMA,
      },
    })
  : null;
