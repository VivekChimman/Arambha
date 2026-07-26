import type { Metadata } from "next";
import { LegalStub } from "@/components/site/LegalStub";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function RefundsPage() {
  return (
    <LegalStub
      title="Refund & Cancellation Policy"
      summary="What happens if the ₹199/month membership isn’t right for you. You can cancel any time and keep access until the period ends. If you haven’t generated a report in the current period, ask us and we’ll refund it in full — once a researched report is built, that month is used. Spelled out before you pay, not after."
    />
  );
}
