"use client";

import { Badge } from "@/components/ui/badge";
import { getMethod } from "@/data/methods";
import {
  buildResultAnnouncement,
  formatReturnValue,
} from "@/lib/playground/display";
import { usePlaygroundStore } from "@/store/playground-store";

export function ResultPanel() {
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const list = usePlaygroundStore((state) => state.list);
  const method = getMethod(selectedMethod);

  const announcement = lastResult
    ? buildResultAnnouncement(lastResult, list.length)
    : `${method.label} is ready to run.`;

  const listChanged = lastResult
    ? lastResult.mutates && !lastResult.error
    : method.mutates;
  const returns = lastResult
    ? lastResult.error
      ? "—"
      : formatReturnValue(lastResult.returnValue)
    : method.returnType;

  return (
    <section
      aria-labelledby="result-panel-heading"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="result-panel-heading" className="text-sm font-medium">
          Result
        </h3>
        {lastResult?.error ? (
          <Badge variant="destructive">{lastResult.error.type}</Badge>
        ) : lastResult ? (
          <Badge variant="outline">Ran</Badge>
        ) : (
          <Badge variant="outline">Preview</Badge>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {lastResult?.error ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-sm font-medium text-destructive">
            {lastResult.error.type}
          </p>
          <p className="text-sm text-muted-foreground">
            {lastResult.error.friendlyMessage}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {lastResult.error.message}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {lastResult ? lastResult.explanation : method.explanation}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">List changed</dt>
          <dd className="font-medium">{listChanged ? "Yes" : "No"}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Returns</dt>
          <dd className="font-mono break-all">{returns}</dd>
        </div>
      </dl>
    </section>
  );
}
