import { Badge } from "@/components/ui/badge";

export function ResultPanel() {
  return (
    <section
      aria-labelledby="result-panel-heading"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="result-panel-heading" className="text-sm font-medium">
          Result
        </h3>
        <Badge variant="outline">Preview</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-mono text-foreground">append()</span> will add{" "}
        <span className="font-mono text-foreground">&quot;mango&quot;</span> to
        the end of the list. The list changes. Python returns{" "}
        <span className="font-mono text-foreground">None</span>.
      </p>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Changes list</dt>
          <dd className="font-medium">Yes</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Returns</dt>
          <dd className="font-mono">None</dd>
        </div>
      </dl>
    </section>
  );
}
