import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/landing/Hero";
import { ValueStrip } from "@/components/landing/ValueStrip";
import { Stats } from "@/components/landing/Stats";
import { ForWhom } from "@/components/landing/ForWhom";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Paths } from "@/components/landing/Paths";
import { TrustScam } from "@/components/landing/TrustScam";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <ValueStrip />
        <Stats />
        <ForWhom />
        <HowItWorks />
        <Paths />
        <TrustScam />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
