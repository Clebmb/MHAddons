import { createClient } from "@supabase/supabase-js";
import { appConfig, isSupabaseConfigured } from "../lib/config.js";

export const supabase = isSupabaseConfigured
  ? createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRoleKey, {
      db: { schema: appConfig.supabaseSchema },
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;
