import type { Metadata } from "next";
import { LegalStub } from "@/components/site/LegalStub";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalStub
      title="Privacy Policy"
      summary="How Arambha handles your information. Our starting principle is to collect as little as possible — and, for now, to store nothing at all."
    />
  );
}
