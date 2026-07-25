import { createClient } from "@/lib/supabase/server";

/** The signed-in user (server-side), or null. */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
