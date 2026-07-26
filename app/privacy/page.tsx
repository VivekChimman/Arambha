import type { Metadata } from "next";
import { LegalStub } from "@/components/site/LegalStub";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalStub
      title="Privacy Policy"
      summary="How Arambha handles your information. We collect as little as we can. If you have an account, we store your email, the answers you gave us, the roadmaps we build for you, and your follow-up messages — nothing else. Your questions are sent to a search and AI provider outside India to research your roadmap, and we never store your IP address in readable form."
    />
  );
}
