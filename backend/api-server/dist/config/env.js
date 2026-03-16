"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const optionalString = zod_1.z.preprocess((value) => {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
}, zod_1.z.string().optional());
const optionalBoolean = zod_1.z.preprocess((value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value !== 'string') {
        return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
        return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
        return false;
    }
    return undefined;
}, zod_1.z.boolean().optional());
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    SUPABASE_URL: optionalString,
    SUPABASE_SERVICE_ROLE_KEY: optionalString,
    DATABASE_URL: optionalString,
    PG_SSL_REJECT_UNAUTHORIZED: optionalBoolean,
    PG_SSL_CA: optionalString,
    SUPABASE_DB_SCHEMA: zod_1.z.string().default('public'),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map