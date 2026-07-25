import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-glow" />
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
