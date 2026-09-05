import { COMPARISON_PREVIEWS } from "@/data/comparisons";

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
          Nearby methods can look similar and behave very differently. These
          pairings will become interactive later.
        </p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {COMPARISON_PREVIEWS.map((comparison) => (
          <li
            key={comparison.id}
            className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-card/70 px-4 py-4"
          >
            <p className="font-mono text-sm">
              {comparison.left}{" "}
              <span className="text-muted-foreground">vs</span>{" "}
              {comparison.right}
            </p>
            <p className="text-sm text-muted-foreground">{comparison.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
