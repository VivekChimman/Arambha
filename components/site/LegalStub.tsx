import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LinkButton } from "@/components/ui/Button";

/**
 * Honest placeholder for the three launch-required legal pages (Privacy, Terms,
 * Refunds — see CLAUDE.md). Deliberately NOT fake policy text: it states the
 * page is in preparation so footer links resolve instead of 404-ing, without
 * presenting a non-existent policy as real.
 */
export function LegalStub({ title, summary }: { title: string; summary: string }) {
  return (
    <>
      <Nav />
      <main id="main" className="relative overflow-hidden border-t border-line-soft">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-glow" />
        <section className="shell relative py-20 sm:py-28">
          <div className="max-w-prose">
            <p className="eyebrow">
              <span className="h-px w-6 bg-accent" />
              Legal
            </p>
            <h1 className="mt-5 text-display-lg text-fg">{title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-fg-dim">{summary}</p>

            <div className="card mt-8 p-6">
              <p className="text-sm leading-relaxed text-fg-mute">
                <strong className="text-fg-dim">This page is in preparation.</strong> Arambha is
                pre-launch and this document is being finalised — it will be published in full here
                before we open to the public. Until then, treat it as a placeholder, not a binding
                policy. If you have already created an account, see the summary above for what we
                hold today.
              </p>
            </div>

            <div className="card mt-4 p-6">
              <p className="text-sm leading-relaxed text-fg-mute">
                <strong className="text-fg-dim">
                  Data protection &amp; grievances (India — DPDP Act 2023).
                </strong>{" "}
                For any data-protection question, a copy of your data, or to have your account and
                everything in it deleted, contact the owner,{" "}
                <strong className="text-fg-dim">Vivekanand Chimman</strong>, at{" "}
                <a
                  href="mailto:chimmanvivek@gmail.com"
                  className="text-accent underline decoration-line underline-offset-2 hover:opacity-80"
                >
                  chimmanvivek@gmail.com
                </a>
                . We aim to acknowledge within 72 hours and respond within 7 working days.
              </p>
            </div>

            <div className="mt-10">
              <LinkButton href="/" variant="outline" size="lg">
                ← Back to home
              </LinkButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
