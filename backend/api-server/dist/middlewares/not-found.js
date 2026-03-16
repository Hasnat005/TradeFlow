"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
const app_error_1 = require("../utils/app-error");
function notFoundHandler(req, _res, next) {
    next(new app_error_1.AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}
//# sourceMappingURL=not-found.js.map