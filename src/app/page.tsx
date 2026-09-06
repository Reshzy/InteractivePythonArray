import dynamic from "next/dynamic";

import { Playground } from "@/components/playground/Playground";

const MethodsPreview = dynamic(() =>
  import("@/components/methods/MethodsPreview").then((mod) => ({
    default: mod.MethodsPreview,
  })),
);

const ComparisonsPreview = dynamic(() =>
  import("@/components/comparisons/ComparisonsPreview").then((mod) => ({
    default: mod.ComparisonsPreview,
  })),
);

const ChallengesSection = dynamic(() =>
  import("@/components/challenges/ChallengesSection").then((mod) => ({
    default: mod.ChallengesSection,
  })),
);

export default function Home() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Playground headingLevel="h1" />
      <MethodsPreview />
      <ComparisonsPreview />
      <ChallengesSection />
    </main>
  );
}
