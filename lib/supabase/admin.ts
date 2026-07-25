import { createClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client — BYPASSES RLS. Server-only, for webhook/admin
 * writes (e.g. updating a subscription on a DODO event). Never import client-side.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, serverEnv.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
