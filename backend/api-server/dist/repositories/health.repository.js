"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRepository = void 0;
const supabase_1 = require("../config/supabase");
const postgres_1 = require("../config/postgres");
class HealthRepository {
    async checkPostgres() {
        if (!postgres_1.pgPool) {
            return { configured: false, status: 'skipped' };
        }
        try {
            await postgres_1.pgPool.query('select 1 as ok');
            return { configured: true, status: 'up' };
        }
        catch {
            return { configured: true, status: 'down' };
        }
    }
    checkSupabase() {
        return {
            configured: supabase_1.isSupabaseConfigured,
            status: supabase_1.isSupabaseConfigured ? 'configured' : 'skipped',
        };
    }
}
exports.HealthRepository = HealthRepository;
//# sourceMappingURL=health.repository.js.map