"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const error_handler_1 = require("./middlewares/error-handler");
const not_found_1 = require("./middlewares/not-found");
const request_logger_1 = require("./middlewares/request-logger");
const routes_1 = require("./routes");
exports.app = (0, express_1.default)();
exports.app.disable('x-powered-by');
exports.app.use(request_logger_1.requestLogger);
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use((0, compression_1.default)());
exports.app.use(express_1.default.json({ limit: '1mb' }));
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.get('/', (_req, res) => {
    res.status(200).json({
        service: 'TradeFlow API',
        status: 'ok',
        environment: env_1.env.NODE_ENV,
    });
});
exports.app.use(env_1.env.API_PREFIX, routes_1.appRouter);
exports.app.use(not_found_1.notFoundHandler);
exports.app.use(error_handler_1.errorHandler);
//# sourceMappingURL=app.js.map