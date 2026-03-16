"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const app_error_1 = require("../utils/app-error");
function validateRequest(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            next(new app_error_1.AppError(400, 'Request validation failed', 'VALIDATION_ERROR', error));
        }
    };
}
//# sourceMappingURL=validate-request.js.map