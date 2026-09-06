"use client";

import { Badge } from "@/components/ui/badge";
import { getMethod } from "@/data/methods";
import {
  buildResultAnnouncement,
  formatReturnValue,
  shouldShowExactErrorMessage,
} from "@/lib/playground/display";
import { usePlaygroundStore } from "@/store/playground-store";

export function ResultPanel({
  headingLevel = "h3",
}: {
  headingLevel?: "h2" | "h3";
}) {
  const HeadingTag = headingLevel;
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const list = usePlaygroundStore((state) => state.list);
  const resultRevealed = usePlaygroundStore((state) => state.resultRevealed);
  const resultView = usePlaygroundStore((state) => state.resultView);
  const isAnimating = usePlaygroundStore((state) => state.isAnimating);
  const playbackKind = usePlaygroundStore((state) => state.playbackKind);
  const steps = usePlaygroundStore((state) => state.steps);
  const stepIndex = usePlaygroundStore((state) => state.stepIndex);
  const method = getMethod(selectedMethod);

  const currentStep = playbackKind === "step" ? steps[stepIndex] : undefined;
  const stepping = Boolean(currentStep);
  const live = resultView === "live" || resultView === "undone";
  const showResult = Boolean(lastResult) && resultRevealed && !stepping && live;
  const undone = resultView === "undone" && showResult;
  const announcement = stepping && currentStep
    ? currentStep.explanation
    : showResult && lastResult
      ? buildResultAnnouncement(lastResult, list.length)
      : isAnimating
        ? "The list operation is playing."
        : "";

  const listChanged = showResult && lastResult
    ? lastResult.mutates && !lastResult.error
    : null;
  const returns = showResult && lastResult
    ? lastResult.error
      ? "—"
      : formatReturnValue(lastResult.returnValue)
    : (isAnimating || stepping) && lastResult
      ? "…"
      : method.returnType;
  const returnedNone =
    showResult &&
    lastResult &&
    !lastResult.error &&
    lastResult.returnValue !== undefined &&
    !Array.isArray(lastResult.returnValue) &&
    lastResult.returnValue.type === "none";

  return (
    <section
      aria-labelledby="result-panel-heading"
      className="flex max-w-[65ch] flex-col gap-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <HeadingTag id="result-panel-heading" className="text-sm font-medium">
          Result
        </HeadingTag>
        {stepping ? (
          <Badge variant="outline">Step</Badge>
        ) : undone ? (
          <Badge variant="outline">Undone</Badge>
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

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {showResult && lastResult?.error ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-sm font-medium text-destructive">
            {lastResult.error.type}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {lastResult.error.friendlyMessage}
          </p>
          {lastResult.error.guidance ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
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
        <p className="text-sm leading-relaxed text-destructive">
          {currentStep.explanation}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {stepping && currentStep
            ? currentStep.explanation
            : showResult && lastResult
              ? lastResult.explanation
              : method.explanation}
        </p>
      )}

      {returnedNone ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          None means there is no new value — the list itself changed.
        </p>
      ) : null}

      {undone ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          The list is restored. History still keeps this run so you can redo it.
        </p>
      ) : null}

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-1 rounded-lg bg-muted/70 px-3 py-2">
          <dt className="text-xs text-muted-foreground">
            {undone ? "List" : "List changed"}
          </dt>
          <dd className="font-medium">
            {undone
              ? "Restored"
              : showResult
                ? listChanged
                  ? "Yes"
                  : "No"
                : isAnimating || stepping
                  ? "…"
                  : "—"}
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
