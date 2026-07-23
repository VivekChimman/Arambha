import type { Metadata } from "next";
import { IntakeFlow } from "@/components/intake/IntakeFlow";

export const metadata: Metadata = {
  title: "Build my roadmap",
  description: "Answer a few honest questions and Arambha maps three real paths for your restart.",
};

export default function StartPage() {
  return <IntakeFlow />;
}
