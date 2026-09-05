export function ChallengesPlaceholder() {
  return (
    <section
      id="challenges"
      aria-labelledby="challenges-heading"
      className="scroll-mt-20 mx-auto w-full max-w-6xl px-4 py-12 pb-16"
    >
      <div className="max-w-2xl rounded-xl border border-dashed border-border bg-muted/40 px-5 py-6">
        <h2
          id="challenges-heading"
          className="text-xl font-medium tracking-tight"
        >
          Challenges
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Short list puzzles will live here after the playground can actually
          run operations. For now, stay in the visualizer and learn the methods
          by name.
        </p>
      </div>
    </section>
  );
}
