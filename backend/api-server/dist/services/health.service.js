"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
class HealthService {
    healthRepository;
    constructor(healthRepository) {
        this.healthRepository = healthRepository;
    }
    async getReadinessReport(verbose) {
        const [postgres, supabase] = await Promise.all([
            this.healthRepository.checkPostgres(),
            Promise.resolve(this.healthRepository.checkSupabase()),
        ]);
        const isReady = postgres.status !== 'down';
        return {
            ready: isReady,
            ...(verbose
                ? {
                    integrations: {
                        postgres,
                        supabase,
                    },
                }
                : {}),
        };
    }
}
exports.HealthService = HealthService;
//# sourceMappingURL=health.service.js.map