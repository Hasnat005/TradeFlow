"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const env_1 = require("../config/env");
class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    getHealth(_req, res) {
        res.status(200).json({
            success: true,
            data: {
                service: 'TradeFlow API',
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: env_1.env.NODE_ENV,
            },
        });
    }
    async getReadiness(req, res) {
        const query = req.query;
        const verboseValue = query.verbose;
        const verbose = verboseValue === true ||
            verboseValue === 1 ||
            (typeof verboseValue === 'string' && ['true', '1'].includes(verboseValue.toLowerCase()));
        const report = await this.healthService.getReadinessReport(verbose);
        res.status(report.ready ? 200 : 503).json({
            success: report.ready,
            data: report,
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map