"use client";

import { getMethod } from "@/data/methods";
import {
  formatReturnValue,
  previewOperationCode,
} from "@/lib/playground/display";
import { usePlaygroundStore } from "@/store/playground-store";

export function OperationCaption() {
  const variableName = usePlaygroundStore((state) => state.variableName);
  const list = usePlaygroundStore((state) => state.list);
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const operationArguments = usePlaygroundStore((state) => state.arguments);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const resultRevealed = usePlaygroundStore((state) => state.resultRevealed);
  const isAnimating = usePlaygroundStore((state) => state.isAnimating);
  const method = getMethod(selectedMethod);

  const pendingCode = previewOperationCode({
    list,
    variableName,
    method: selectedMethod,
    arguments: operationArguments,
  });

  const showResult = Boolean(lastResult) && resultRevealed;
  const code = showResult && lastResult ? lastResult.code : pendingCode;
  const returns =
    showResult && lastResult
      ? lastResult.error
        ? lastResult.error.type
        : formatReturnValue(lastResult.returnValue)
      : isAnimating
        ? "…"
        : method.returnType;

  return (
    <p
      data-operation-caption
      className="min-h-11 font-mono text-sm text-foreground md:text-base"
    >
      <span>{code}</span>
      <span className="text-muted-foreground">
        {showResult && lastResult?.error
          ? ` — ${lastResult.error.friendlyMessage}`
          : ` — returns ${returns}`}
      </span>
    </p>
  );
}
