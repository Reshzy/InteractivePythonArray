import { Badge } from "@/components/ui/badge";
import { METHOD_CATEGORIES, METHODS } from "@/data/methods";
import { DEMO_SELECTED_METHOD_ID } from "@/data/playground-demo";
import { cn } from "@/lib/utils";

export function MethodNavigation() {
  return (
    <section aria-labelledby="method-nav-heading" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 id="method-nav-heading" className="text-sm font-medium">
          Selected method
        </h3>
        <Badge variant="secondary">append()</Badge>
      </div>

      <div className="flex flex-col gap-3">
        {METHOD_CATEGORIES.map((category) => {
          const methods = METHODS.filter(
            (method) => method.category === category.id
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
                  const isSelected = method.id === DEMO_SELECTED_METHOD_ID;

                  return (
                    <span
                      key={method.id}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-lg border px-3 font-mono text-xs",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                      )}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      {method.label}
                    </span>
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
