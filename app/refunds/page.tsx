import type { Metadata } from "next";
import { LegalStub } from "@/components/site/LegalStub";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function RefundsPage() {
  return (
    <LegalStub
      title="Refund & Cancellation Policy"
      summary="What happens with the one-time ₹199 report if it isn’t right for you. Fair terms, spelled out before you pay."
    />
  );
}
