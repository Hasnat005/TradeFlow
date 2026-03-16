"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readinessQuerySchema = void 0;
const zod_1 = require("zod");
const booleanFromQuery = zod_1.z.preprocess((value) => {
    if (value === 'true' || value === true) {
        return true;
    }
    if (value === 'false' || value === false || value === undefined) {
        return false;
    }
    return value;
}, zod_1.z.boolean());
exports.readinessQuerySchema = zod_1.z.object({
    verbose: booleanFromQuery.optional().default(false),
});
//# sourceMappingURL=health.validation.js.map