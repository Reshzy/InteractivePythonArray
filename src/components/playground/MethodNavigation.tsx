"use client";

import { Badge } from "@/components/ui/badge";
import { getMethod, METHOD_CATEGORIES, METHODS } from "@/data/methods";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/store/playground-store";

export function MethodNavigation() {
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const setSelectedMethod = usePlaygroundStore(
    (state) => state.setSelectedMethod,
  );
  const selected = getMethod(selectedMethod);

  return (
    <section aria-labelledby="method-nav-heading" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 id="method-nav-heading" className="text-sm font-medium">
          Selected method
        </h3>
        <Badge variant="secondary">{selected.label}</Badge>
      </div>

      <div className="flex flex-col gap-3">
        {METHOD_CATEGORIES.map((category) => {
          const methods = METHODS.filter(
            (method) => method.category === category.id,
          );

          return (
            <div key={category.id} className="flex flex-col gap-1.5">
              <p className="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
                {category.label}
              </p>
              <div
                role="group"
                aria-label={category.label}
                className="flex flex-wrap gap-1.5"
              >
                {methods.map((method) => {
                  const isSelected = method.id === selectedMethod;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-lg border px-3 font-mono text-xs transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
