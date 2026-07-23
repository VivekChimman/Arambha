import type { Metadata } from "next";
import { LegalStub } from "@/components/site/LegalStub";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalStub
      title="Terms of Service"
      summary="The terms you agree to when you use Arambha. Written plainly, because a document you can’t read isn’t consent."
    />
  );
}
