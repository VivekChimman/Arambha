import type { Metadata } from "next";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { IntakeFlow } from "@/components/intake/IntakeFlow";

export const metadata: Metadata = {
  title: "Build my roadmap",
  description: "Answer a few honest questions and Arambha maps three real paths for your restart.",
};

// Which engine runs depends on who's asking, so this page can't be static.
export const dynamic = "force-dynamic";

export default async function StartPage() {
  let signedIn = false;
  if (env.hasSupabase) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  return <IntakeFlow signedIn={signedIn} />;
}
