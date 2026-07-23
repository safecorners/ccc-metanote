import { ClosingCta } from "@/components/landing/closing-cta";
import { FeatureGapScore } from "@/components/landing/feature-gap-score";
import { FeaturePatterns } from "@/components/landing/feature-patterns";
import { FeatureTagging } from "@/components/landing/feature-tagging";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { NavBar } from "@/components/landing/nav-bar";

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <FeatureTagging />
        <FeaturePatterns />
        <FeatureGapScore />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
