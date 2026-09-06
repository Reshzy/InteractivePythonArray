import type { CellVisualState } from "@/lib/animations/highlights";
import { SORT_DISCLAIMER, type SecondaryLabels } from "@/lib/animations/playback";
import { formatPythonValue } from "@/lib/python/format";
import type { ListItem, MethodId, OperationResult } from "@/lib/python/types";
import { cloneList } from "@/lib/python/values";

export const STEP_MODE_METHODS = [
  "len",
  "count",
  "index",
  "insert",
  "remove",
  "pop",
  "sort",
  "sorted",
] as const satisfies readonly MethodId[];

export type StepModeMethod = (typeof STEP_MODE_METHODS)[number];

export type OperationStep = {
  id: string;
  label: string;
  explanation: string;
  activeIndices?: number[];
  matchedIndices?: number[];
  highlight?: CellVisualState;
  matchHighlight?: CellVisualState;
  statePreview?: ListItem[];
  secondaryPreview?: ListItem[] | null;
  secondaryLabels?: SecondaryLabels | null;
  scanCount?: number | null;
  disclaimer?: string | null;
  error?: boolean;
};

export function isStepModeMethod(method: MethodId): method is StepModeMethod {
  return STEP_MODE_METHODS.some((item) => item === method);
}

export function buildOperationSteps(input: {
  result: OperationResult;
  method: MethodId;
}): OperationStep[] {
  if (!isStepModeMethod(input.method)) {
    return [];
  }

  const { result, method } = input;

  if (result.animation.type === "none") {
    if (result.error) {
      return [
        {
          id: "error",
          label: result.error.type,
          explanation: result.error.friendlyMessage,
          statePreview: cloneList(result.before),
          error: true,
        },
      ];
    }
    return [];
  }

  switch (method) {
    case "len":
      return buildLenSteps(result);
    case "count":
      return buildCountSteps(result);
    case "index":
      return buildIndexSteps(result);
    case "insert":
      return buildInsertSteps(result);
    case "remove":
      return buildRemoveSteps(result);
    case "pop":
      return buildPopSteps(result);
    case "sort":
    case "sorted":
      return buildSortSteps(result, method);
  }
}

export function cellVisualStateAt(
  step: OperationStep,
  index: number,
): CellVisualState {
  if (step.matchedIndices?.includes(index)) {
    return step.matchHighlight ?? "matched";
  }
  if (step.activeIndices?.includes(index)) {
    return step.highlight ?? "scanned";
  }
  return "idle";
}

function formatAt(list: readonly ListItem[], index: number): string {
  const item = list[index];
  return item ? formatPythonValue(item.value) : "—";
}

function buildLenSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const scanned =
    result.animation.type === "scan" ? result.animation.scannedIndices : [];
  const steps: OperationStep[] = scanned.map((index, stepIndex) => ({
    id: `scan-${index}`,
    label: `Count index ${index}`,
    explanation: `Index ${index} holds ${formatAt(before, index)}. The count is now ${stepIndex + 1}.`,
    activeIndices: [index],
    matchedIndices: scanned.slice(0, stepIndex + 1),
    scanCount: stepIndex + 1,
    statePreview: before,
  }));

  steps.push({
    id: "result",
    label: "Length",
    explanation: result.explanation,
    matchedIndices: scanned,
    scanCount: before.length,
    statePreview: before,
  });

  return steps;
}

function buildCountSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const scanned =
    result.animation.type === "scan" ? result.animation.scannedIndices : [];
  const matched =
    result.animation.type === "scan" ? result.animation.matchedIndices : [];
  const seen: number[] = [];
  const steps: OperationStep[] = [];

  for (const index of scanned) {
    const isMatch = matched.includes(index);
    if (isMatch) {
      seen.push(index);
    }
    steps.push({
      id: `scan-${index}`,
      label: `Check index ${index}`,
      explanation: isMatch
        ? `Index ${index} is a match. Count is now ${seen.length}.`
        : `Index ${index} is not a match. Count is still ${seen.length}.`,
      activeIndices: [index],
      matchedIndices: [...seen],
      scanCount: seen.length,
      statePreview: before,
    });
  }

  steps.push({
    id: "result",
    label: "Count",
    explanation: result.explanation,
    matchedIndices: matched,
    scanCount: matched.length,
    statePreview: before,
  });

  return steps;
}

function buildIndexSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const scanned =
    result.animation.type === "scan" ? result.animation.scannedIndices : [];
  const matched =
    result.animation.type === "scan" ? result.animation.matchedIndices : [];
  const steps: OperationStep[] = [];

  for (const index of scanned) {
    const isMatch = matched.includes(index);
    steps.push({
      id: `scan-${index}`,
      label: `Check index ${index}`,
      explanation: isMatch
        ? `Index ${index} matches. index() stops at the first match.`
        : `Index ${index} is ${formatAt(before, index)}. Not a match yet.`,
      activeIndices: [index],
      matchedIndices: isMatch ? [index] : [],
      highlight: isMatch ? "matched" : "scanned",
      statePreview: before,
    });
  }

  if (result.error) {
    steps.push({
      id: "error",
      label: result.error.type,
      explanation: result.error.friendlyMessage,
      statePreview: before,
      error: true,
    });
    return steps;
  }

  steps.push({
    id: "result",
    label: "Index",
    explanation: result.explanation,
    matchedIndices: matched,
    statePreview: before,
  });

  return steps;
}

function buildInsertSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const after = cloneList(result.after);
  if (result.animation.type !== "insert") {
    return [];
  }

  const insertedIndex = result.animation.insertedIndex;
  const highlightIndex =
    insertedIndex < before.length
      ? insertedIndex
      : Math.max(before.length - 1, 0);

  return [
    {
      id: "target",
      label: "Find index",
      explanation:
        before.length === 0
          ? "The list is empty, so the new item will be placed at index 0."
          : `Insert at index ${insertedIndex}. Items at this index and after will shift to the right.`,
      activeIndices: before.length === 0 ? [] : [highlightIndex],
      highlight: "active-index",
      statePreview: before,
    },
    {
      id: "insert",
      label: "Insert",
      explanation: result.explanation,
      matchedIndices: [insertedIndex],
      matchHighlight: "inserted",
      statePreview: after,
    },
  ];
}

function buildRemoveSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const after = cloneList(result.after);

  if (result.animation.type === "scan") {
    const steps: OperationStep[] = result.animation.scannedIndices.map(
      (index) => ({
        id: `scan-${index}`,
        label: `Check index ${index}`,
        explanation: `Index ${index} is ${formatAt(before, index)}. Not a match.`,
        activeIndices: [index],
        statePreview: before,
      }),
    );
    steps.push({
      id: "error",
      label: result.error?.type ?? "ValueError",
      explanation: result.error?.friendlyMessage ?? result.explanation,
      statePreview: before,
      error: true,
    });
    return steps;
  }

  if (result.animation.type !== "remove") {
    return [];
  }

  const { removedIndex, scannedIndices } = result.animation;
  const steps: OperationStep[] = [];

  for (const index of scannedIndices) {
    const isMatch = index === removedIndex;
    steps.push({
      id: `scan-${index}`,
      label: `Check index ${index}`,
      explanation: isMatch
        ? `Index ${index} matches. remove() deletes only this first match.`
        : `Index ${index} is ${formatAt(before, index)}. Not a match yet.`,
      activeIndices: [index],
      matchedIndices: isMatch ? [index] : [],
      highlight: isMatch ? "matched" : "scanned",
      statePreview: before,
    });
  }

  steps.push({
    id: "remove",
    label: "Remove",
    explanation: result.explanation,
    statePreview: after,
  });

  return steps;
}

function buildPopSteps(result: OperationResult): OperationStep[] {
  const before = cloneList(result.before);
  const after = cloneList(result.after);
  if (result.animation.type !== "pop") {
    return [];
  }

  const removedIndex = result.animation.removedIndex;
  const removed = before[removedIndex];

  return [
    {
      id: "target",
      label: "Choose index",
      explanation: `pop() will remove the item at index ${removedIndex}.`,
      activeIndices: [removedIndex],
      highlight: "active-index",
      statePreview: before,
    },
    {
      id: "remove",
      label: "Remove and return",
      explanation: removed
        ? `${formatPythonValue(removed.value)} was removed and returned.`
        : result.explanation,
      statePreview: after,
    },
  ];
}

function buildSortSteps(
  result: OperationResult,
  method: "sort" | "sorted",
): OperationStep[] {
  const before = cloneList(result.before);
  const sortedList = Array.isArray(result.returnValue)
    ? cloneList(result.returnValue)
    : cloneList(result.after);
  const secondary = method === "sorted";

  return [
    {
      id: "before",
      label: "Current order",
      explanation: "Python will reorder these items.",
      statePreview: before,
      disclaimer: SORT_DISCLAIMER,
    },
    {
      id: "after",
      label: secondary ? "New sorted list" : "Sorted order",
      explanation: result.explanation,
      statePreview: secondary ? before : cloneList(result.after),
      secondaryPreview: secondary ? sortedList : null,
      secondaryLabels: secondary
        ? { source: "original", destination: "sorted" }
        : null,
      disclaimer: SORT_DISCLAIMER,
    },
  ];
}
