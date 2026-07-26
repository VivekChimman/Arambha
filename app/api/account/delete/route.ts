import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/account";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/account/delete — erase the account and everything in it (DPDP).
 *
 * Irreversible. The caller must re-state their own email as confirmation, so a
 * stray click (or a cross-site POST) can't destroy someone's data. An active
 * subscription is cancelled at DODO first; if that fails we refuse rather than
 * delete an account that would keep being billed.
 */
export async function POST(request: Request) {
  try {
    if (!env.hasSupabase) {
      return NextResponse.json(
        { error: "Accounts are temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const limited = await rateLimit("account", clientKey(request, user.id));
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const body = (await request.json().catch(() => ({}))) as { confirmEmail?: unknown };
    const confirmEmail =
      typeof body.confirmEmail === "string" ? body.confirmEmail.trim().toLowerCase() : "";

    if (!confirmEmail || confirmEmail !== (user.email ?? "").toLowerCase()) {
      return NextResponse.json(
        { error: "Type your email address exactly to confirm." },
        { status: 400 },
      );
    }

    const outcome = await deleteAccount(user.id);
    if (!outcome.ok) {
      return NextResponse.json(
        {
          error:
            "We couldn’t cancel your subscription just now, so we haven’t deleted anything — that way you can’t be charged for an account you can’t reach. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    // Clear the session cookie; the user row is already gone.
    await supabase.auth.signOut().catch(() => {});

    return NextResponse.json({ deleted: true, cancelledSubscription: outcome.cancelledSubscription });
  } catch (e) {
    console.error("[account/delete] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Something went wrong on our side. Nothing was deleted. Please try again." },
      { status: 500 },
    );
  }
}
