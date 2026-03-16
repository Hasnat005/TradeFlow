"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.isSupabaseConfigured = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
const canInitSupabase = Boolean(env_1.env.SUPABASE_URL && env_1.env.SUPABASE_SERVICE_ROLE_KEY);
exports.isSupabaseConfigured = canInitSupabase;
exports.supabaseAdmin = canInitSupabase
    ? (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: {
            schema: env_1.env.SUPABASE_DB_SCHEMA,
        },
    })
    : null;
//# sourceMappingURL=supabase.js.map