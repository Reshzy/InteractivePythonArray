import { MethodExplorer } from "@/components/methods/MethodExplorer";

export function MethodsPreview() {
  return (
    <section
      id="methods"
      aria-labelledby="methods-heading"
      className="scroll-mt-20 mx-auto w-full max-w-6xl px-4 py-12"
    >
      <div className="mb-6 max-w-2xl">
        <h2 id="methods-heading" className="text-xl font-medium tracking-tight">
          Methods
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Python lists have methods such as append(), and built-in functions
          such as len(). Use a card as a short reference, then try it in the
          playground.
        </p>
      </div>

      <MethodExplorer />
    </section>
  );
}
