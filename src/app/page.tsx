import { ChallengesSection } from "@/components/challenges/ChallengesSection";
import { ComparisonsPreview } from "@/components/comparisons/ComparisonsPreview";
import { Hero } from "@/components/hero/Hero";
import { MethodsPreview } from "@/components/methods/MethodsPreview";
import { Playground } from "@/components/playground/Playground";

export default function Home() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />
      <Playground />
      <MethodsPreview />
      <ComparisonsPreview />
      <ChallengesSection />
    </main>
  );
}
