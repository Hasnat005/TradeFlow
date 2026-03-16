"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_1 = require("../utils/app-error");
const logger_1 = require("../utils/logger");
const errorHandler = (error, _req, res, next) => {
    void next;
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
        });
    }
    logger_1.logger.error({ error }, 'Unhandled error');
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map