"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const validate_request_1 = require("../middlewares/validate-request");
const health_repository_1 = require("../repositories/health.repository");
const health_service_1 = require("../services/health.service");
const async_handler_1 = require("../utils/async-handler");
const health_1 = require("../modules/health");
const healthRepository = new health_repository_1.HealthRepository();
const healthService = new health_service_1.HealthService(healthRepository);
const healthController = new health_controller_1.HealthController(healthService);
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', (req, res) => healthController.getHealth(req, res));
exports.healthRouter.get('/readiness', (0, validate_request_1.validateRequest)({ query: health_1.readinessQuerySchema }), (0, async_handler_1.asyncHandler)((req, res) => healthController.getReadiness(req, res)));
//# sourceMappingURL=health.routes.js.map