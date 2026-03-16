import { isSupabaseConfigured } from '../config/supabase';
import { pgPool } from '../config/postgres';

export class HealthRepository {
  async checkPostgres() {
    if (!pgPool) {
      return { configured: false, status: 'skipped' as const };
    }

    try {
      await pgPool.query('select 1 as ok');
      return { configured: true, status: 'up' as const };
    } catch {
      return { configured: true, status: 'down' as const };
    }
  }

  checkSupabase() {
    return {
      configured: isSupabaseConfigured,
      status: isSupabaseConfigured ? ('configured' as const) : ('skipped' as const),
    };
  }
}
