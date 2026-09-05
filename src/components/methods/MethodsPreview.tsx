import { METHOD_CATEGORIES, METHODS } from "@/data/methods";

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
          Every playground operation is a Python built-in or list method. These
          cards are a map of what you will be able to run next.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {METHOD_CATEGORIES.map((category) => {
          const methods = METHODS.filter(
            (method) => method.category === category.id
          );

          return (
            <div key={category.id} className="flex flex-col gap-3">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {category.label}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {methods.map((method) => (
                  <li
                    key={method.id}
                    id={`method-${method.id}`}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <p className="font-mono text-sm font-medium">
                      {method.label}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {method.syntax}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {method.shortDescription}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
