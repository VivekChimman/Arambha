import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Thrown instead of letting @supabase/ssr surface its own config error. */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured in this build.");
    this.name = "SupabaseNotConfiguredError";
  }
}

/** Supabase client for the browser (Client Components). */
export function createClient() {
  // Missing NEXT_PUBLIC_SUPABASE_* (e.g. a build made before the vars were set)
  // would make the library throw a message that ends up rendered to the user.
  if (!env.hasSupabase) throw new SupabaseNotConfiguredError();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
