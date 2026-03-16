import { HealthRepository } from '../repositories/health.repository';

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async getReadinessReport(verbose: boolean) {
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
