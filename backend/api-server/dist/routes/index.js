"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const express_1 = require("express");
const health_routes_1 = require("./health.routes");
exports.appRouter = (0, express_1.Router)();
exports.appRouter.use('/health', health_routes_1.healthRouter);
//# sourceMappingURL=index.js.map