import { ComparisonLessons } from "@/components/comparisons/ComparisonLessons";

export function ComparisonsPreview() {
  return (
    <section
      id="comparisons"
      aria-labelledby="comparisons-heading"
      className="scroll-mt-20 mx-auto w-full max-w-6xl px-4 py-12"
    >
      <div className="mb-6 max-w-2xl">
        <h2
          id="comparisons-heading"
          className="text-xl font-medium tracking-tight"
        >
          Comparisons
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nearby operations can look similar and behave very differently. Each
          pairing shows the difference, then lets you try it in the playground.
        </p>
      </div>

      <ComparisonLessons />
    </section>
  );
}
