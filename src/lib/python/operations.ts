import { indexError, valueError } from "./errors";
import { formatPythonList, formatPythonValue } from "./format";
import { normalizeAccessIndex, normalizeInsertIndex, rangeIndices } from "./indices";
import type {
  AnimationInstruction,
  ListItem,
  OperationRequest,
  OperationResult,
  PlaygroundError,
  PythonValue,
} from "./types";
import {
  cloneList,
  createListItem,
  listIds,
  pythonNone,
  pythonNumber,
  pythonValueEquals,
} from "./values";
import {
  comparePythonValues,
  getSortKind,
  integerIndexError,
  resolveVariableName,
  unsupportedSortError,
} from "./validation";

function success(params: {
  input: readonly ListItem[];
  after: ListItem[];
  mutates: boolean;
  returnValue?: PythonValue | ListItem[];
  code: string;
  explanation: string;
  animation: AnimationInstruction;
}): OperationResult {
  return {
    before: cloneList(params.input),
    after: params.after,
    mutates: params.mutates,
    returnValue: params.returnValue,
    code: params.code,
    explanation: params.explanation,
    animation: params.animation,
  };
}

function failure(params: {
  input: readonly ListItem[];
  error: PlaygroundError;
  code: string;
  animation: AnimationInstruction;
}): OperationResult {
  const before = cloneList(params.input);

  return {
    before,
    after: cloneList(params.input),
    mutates: false,
    error: params.error,
    code: params.code,
    explanation: params.error.friendlyMessage,
    animation: params.animation,
  };
}

function itemCountLabel(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}

function copyWithNewIds(list: readonly ListItem[]): ListItem[] {
  return list.map((item) => createListItem(item.value));
}

function sortItems(
  items: ListItem[],
  reverse: boolean,
): ListItem[] | PlaygroundError {
  if (getSortKind(items) === null) {
    return unsupportedSortError();
  }

  const sorted = [...items];
  sorted.sort((left, right) => {
    const comparison = comparePythonValues(left.value, right.value);
    return reverse ? -comparison : comparison;
  });

  return sorted;
}

function reverseFlag(reverse: boolean): string {
  return reverse ? ", reverse=True" : "";
}

function lenOperation(
  request: Extract<OperationRequest, { method: "len" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const scannedIndices = rangeIndices(request.list.length);

  return success({
    input: request.list,
    after: cloneList(request.list),
    mutates: false,
    returnValue: pythonNumber(request.list.length),
    code: `len(${variableName})`,
    explanation: `The list contains ${itemCountLabel(request.list.length)}.`,
    animation: {
      type: "scan",
      scannedIndices,
      matchedIndices: scannedIndices,
    },
  });
}

function appendOperation(
  request: Extract<OperationRequest, { method: "append" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const after = cloneList(request.list);
  after.push(createListItem(request.args.value));

  return success({
    input: request.list,
    after,
    mutates: true,
    returnValue: pythonNone(),
    code: `${variableName}.append(${formatPythonValue(request.args.value)})`,
    explanation: `${formatPythonValue(request.args.value)} was added to the end of the list.`,
    animation: {
      type: "append",
      addedIndex: after.length - 1,
    },
  });
}

function clearOperation(
  request: Extract<OperationRequest, { method: "clear" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const removedIndices = rangeIndices(request.list.length);

  return success({
    input: request.list,
    after: [],
    mutates: true,
    returnValue: pythonNone(),
    code: `${variableName}.clear()`,
    explanation:
      request.list.length === 0
        ? "The list was already empty."
        : "Every item was removed from the list.",
    animation: {
      type: "clear",
      removedIndices,
    },
  });
}

function copyOperation(
  request: Extract<OperationRequest, { method: "copy" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);

  return success({
    input: request.list,
    after: cloneList(request.list),
    mutates: false,
    returnValue: copyWithNewIds(request.list),
    code: `copied = ${variableName}.copy()`,
    explanation: "A new list was created with the same items.",
    animation: { type: "copy" },
  });
}

function countOperation(
  request: Extract<OperationRequest, { method: "count" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const scannedIndices = rangeIndices(request.list.length);
  const matchedIndices = request.list.flatMap((item, index) =>
    pythonValueEquals(item.value, request.args.value) ? [index] : [],
  );
  const matchCount = matchedIndices.length;

  return success({
    input: request.list,
    after: cloneList(request.list),
    mutates: false,
    returnValue: pythonNumber(matchCount),
    code: `${variableName}.count(${formatPythonValue(request.args.value)})`,
    explanation:
      matchCount === 0
        ? "Python found no matching items."
        : `Python found ${matchCount === 1 ? "1 matching item" : `${matchCount} matching items`}.`,
    animation: {
      type: "scan",
      scannedIndices,
      matchedIndices,
    },
  });
}

function extendOperation(
  request: Extract<OperationRequest, { method: "extend" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const after = cloneList(request.list);
  const startIndex = after.length;

  for (const value of request.args.values) {
    after.push(createListItem(value));
  }

  const addedIndices = rangeIndices(request.args.values.length).map(
    (offset) => startIndex + offset,
  );
  const addedCount = request.args.values.length;

  return success({
    input: request.list,
    after,
    mutates: true,
    returnValue: pythonNone(),
    code: `${variableName}.extend(${formatPythonList(request.args.values)})`,
    explanation:
      addedCount === 0
        ? "No items were added because the iterable was empty."
        : `${itemCountLabel(addedCount)} ${addedCount === 1 ? "was" : "were"} added to the end of the list.`,
    animation: {
      type: "extend",
      addedIndices,
    },
  });
}

function indexOperation(
  request: Extract<OperationRequest, { method: "index" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const formattedValue = formatPythonValue(request.args.value);
  const code = `${variableName}.index(${formattedValue})`;
  const scannedIndices: number[] = [];

  for (let index = 0; index < request.list.length; index += 1) {
    scannedIndices.push(index);
    const item = request.list[index];
    if (item && pythonValueEquals(item.value, request.args.value)) {
      return success({
        input: request.list,
        after: cloneList(request.list),
        mutates: false,
        returnValue: pythonNumber(index),
        code,
        explanation: `${formattedValue} was first found at index ${index}.`,
        animation: {
          type: "scan",
          scannedIndices,
          matchedIndices: [index],
        },
      });
    }
  }

  return failure({
    input: request.list,
    error: valueError(
      `${formattedValue} is not in list`,
      "Python could not find that value in the list.",
    ),
    code,
    animation: {
      type: "scan",
      scannedIndices,
      matchedIndices: [],
    },
  });
}

function insertOperation(
  request: Extract<OperationRequest, { method: "insert" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const formattedValue = formatPythonValue(request.args.value);
  const code = `${variableName}.insert(${request.args.index}, ${formattedValue})`;

  if (!Number.isInteger(request.args.index)) {
    return failure({
      input: request.list,
      error: integerIndexError("insert"),
      code,
      animation: { type: "none" },
    });
  }

  const insertedIndex = normalizeInsertIndex(
    request.args.index,
    request.list.length,
  );
  const after = cloneList(request.list);
  after.splice(insertedIndex, 0, createListItem(request.args.value));
  const shiftedIndices = rangeIndices(request.list.length).filter(
    (index) => index >= insertedIndex,
  );

  return success({
    input: request.list,
    after,
    mutates: true,
    returnValue: pythonNone(),
    code,
    explanation: `${formattedValue} was inserted at index ${insertedIndex}.`,
    animation: {
      type: "insert",
      insertedIndex,
      shiftedIndices,
    },
  });
}

function popOperation(
  request: Extract<OperationRequest, { method: "pop" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const requestedIndex = request.args?.index;
  const code =
    requestedIndex === undefined
      ? `removed = ${variableName}.pop()`
      : `removed = ${variableName}.pop(${requestedIndex})`;

  if (requestedIndex !== undefined && !Number.isInteger(requestedIndex)) {
    return failure({
      input: request.list,
      error: integerIndexError("pop"),
      code,
      animation: { type: "none" },
    });
  }

  if (request.list.length === 0) {
    return failure({
      input: request.list,
      error: indexError(
        "pop from empty list",
        "Python could not pop from an empty list.",
      ),
      code,
      animation: { type: "none" },
    });
  }

  const access = normalizeAccessIndex(
    requestedIndex ?? -1,
    request.list.length,
  );

  if (!access.ok) {
    return failure({
      input: request.list,
      error: indexError(
        "pop index out of range",
        "That index is outside the list, so Python could not pop an item.",
      ),
      code,
      animation: { type: "none" },
    });
  }

  const after = cloneList(request.list);
  const [removed] = after.splice(access.index, 1);
  if (!removed) {
    throw new Error("Unexpected pop: missing item after a valid index.");
  }

  const usedDefaultIndex = requestedIndex === undefined;

  return success({
    input: request.list,
    after,
    mutates: true,
    returnValue: removed.value,
    code,
    explanation: usedDefaultIndex
      ? `${formatPythonValue(removed.value)} was removed from the end of the list and returned.`
      : `${formatPythonValue(removed.value)} was removed from index ${access.index} and returned.`,
    animation: {
      type: "pop",
      removedIndex: access.index,
    },
  });
}

function removeOperation(
  request: Extract<OperationRequest, { method: "remove" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const formattedValue = formatPythonValue(request.args.value);
  const code = `${variableName}.remove(${formattedValue})`;
  const scannedIndices: number[] = [];

  for (let index = 0; index < request.list.length; index += 1) {
    scannedIndices.push(index);
    const item = request.list[index];
    if (item && pythonValueEquals(item.value, request.args.value)) {
      const after = cloneList(request.list);
      after.splice(index, 1);

      return success({
        input: request.list,
        after,
        mutates: true,
        returnValue: pythonNone(),
        code,
        explanation: `${formattedValue} was removed from index ${index}.`,
        animation: {
          type: "remove",
          removedIndex: index,
          scannedIndices,
        },
      });
    }
  }

  return failure({
    input: request.list,
    error: valueError(
      "list.remove(x): x not in list",
      "Python could not remove that value because it is not in the list.",
    ),
    code,
    animation: {
      type: "scan",
      scannedIndices,
      matchedIndices: [],
    },
  });
}

function reverseOperation(
  request: Extract<OperationRequest, { method: "reverse" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const after = cloneList(request.list).reverse();

  return success({
    input: request.list,
    after,
    mutates: true,
    returnValue: pythonNone(),
    code: `${variableName}.reverse()`,
    explanation:
      request.list.length === 0
        ? "The list was empty, so reverse() did not change it."
        : "The items were reordered from last to first.",
    animation: { type: "reverse" },
  });
}

function sortOperation(
  request: Extract<OperationRequest, { method: "sort" | "sorted" }>,
): OperationResult {
  const variableName = resolveVariableName(request.variableName);
  const reverse = request.args?.reverse === true;
  const isBuiltin = request.method === "sorted";
  const code = isBuiltin
    ? `sorted(${variableName}${reverseFlag(reverse)})`
    : `${variableName}.sort(${reverse ? "reverse=True" : ""})`;

  const source = isBuiltin ? copyWithNewIds(request.list) : cloneList(request.list);
  const sorted = sortItems(source, reverse);

  if (!Array.isArray(sorted)) {
    return failure({
      input: request.list,
      error: sorted,
      code,
      animation: { type: "none" },
    });
  }

  const previousOrder = listIds(source);
  const nextOrder = listIds(sorted);
  const direction = reverse ? "descending" : "ascending";

  if (isBuiltin) {
    return success({
      input: request.list,
      after: cloneList(request.list),
      mutates: false,
      returnValue: sorted,
      code,
      explanation: `A new ${direction} list was created. The original list was not changed.`,
      animation: {
        type: "sort",
        previousOrder,
        nextOrder,
      },
    });
  }

  return success({
    input: request.list,
    after: sorted,
    mutates: true,
    returnValue: pythonNone(),
    code,
    explanation: `The list was sorted in ${direction} order.`,
    animation: {
      type: "sort",
      previousOrder,
      nextOrder,
    },
  });
}

export function executeOperation(request: OperationRequest): OperationResult {
  switch (request.method) {
    case "len":
      return lenOperation(request);
    case "append":
      return appendOperation(request);
    case "clear":
      return clearOperation(request);
    case "copy":
      return copyOperation(request);
    case "count":
      return countOperation(request);
    case "extend":
      return extendOperation(request);
    case "index":
      return indexOperation(request);
    case "insert":
      return insertOperation(request);
    case "pop":
      return popOperation(request);
    case "remove":
      return removeOperation(request);
    case "reverse":
      return reverseOperation(request);
    case "sort":
    case "sorted":
      return sortOperation(request);
    default: {
      const exhaustive: never = request;
      throw new Error(`Unsupported operation: ${JSON.stringify(exhaustive)}`);
    }
  }
}
