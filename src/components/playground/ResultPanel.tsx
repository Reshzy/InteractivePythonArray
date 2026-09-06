"use client";

import { Badge } from "@/components/ui/badge";
import { getMethod } from "@/data/methods";
import {
  buildResultAnnouncement,
  formatReturnValue,
  shouldShowExactErrorMessage,
} from "@/lib/playground/display";
import { usePlaygroundStore } from "@/store/playground-store";

export function ResultPanel() {
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const list = usePlaygroundStore((state) => state.list);
  const resultRevealed = usePlaygroundStore((state) => state.resultRevealed);
  const isAnimating = usePlaygroundStore((state) => state.isAnimating);
  const playbackKind = usePlaygroundStore((state) => state.playbackKind);
  const steps = usePlaygroundStore((state) => state.steps);
  const stepIndex = usePlaygroundStore((state) => state.stepIndex);
  const method = getMethod(selectedMethod);

  const currentStep = playbackKind === "step" ? steps[stepIndex] : undefined;
  const stepping = Boolean(currentStep);
  const showResult = Boolean(lastResult) && resultRevealed && !stepping;
  const announcement = stepping && currentStep
    ? currentStep.explanation
    : showResult && lastResult
      ? buildResultAnnouncement(lastResult, list.length)
      : isAnimating
        ? "The list operation is playing."
        : `${method.label} is ready to run.`;

  const listChanged = showResult && lastResult
    ? lastResult.mutates && !lastResult.error
    : method.mutates;
  const returns = showResult && lastResult
    ? lastResult.error
      ? "—"
      : formatReturnValue(lastResult.returnValue)
    : (isAnimating || stepping) && lastResult
      ? "…"
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
        {stepping ? (
          <Badge variant="outline">Step</Badge>
        ) : showResult && lastResult?.error ? (
          <Badge variant="destructive">{lastResult.error.type}</Badge>
        ) : showResult && lastResult ? (
          <Badge variant="outline">Ran</Badge>
        ) : isAnimating ? (
          <Badge variant="outline">Running</Badge>
        ) : (
          <Badge variant="outline">Preview</Badge>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {showResult && lastResult?.error ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-sm font-medium text-destructive">
            {lastResult.error.type}
          </p>
          <p className="text-sm text-muted-foreground">
            {lastResult.error.friendlyMessage}
          </p>
          {lastResult.error.guidance ? (
            <p className="text-sm text-muted-foreground">
              {lastResult.error.guidance}
            </p>
          ) : null}
          {shouldShowExactErrorMessage(lastResult.error) ? (
            <p className="font-mono text-xs text-muted-foreground">
              {lastResult.error.message}
            </p>
          ) : null}
        </div>
      ) : stepping && currentStep?.error ? (
        <p className="text-sm text-destructive">{currentStep.explanation}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {stepping && currentStep
            ? currentStep.explanation
            : showResult && lastResult
              ? lastResult.explanation
              : method.explanation}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">List changed</dt>
          <dd className="font-medium">
            {showResult ? (listChanged ? "Yes" : "No") : isAnimating || stepping ? "…" : listChanged ? "Yes" : "No"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Returns</dt>
          <dd data-result-returns className="font-mono break-all">
            {returns}
          </dd>
        </div>
      </dl>
    </section>
  );
}
