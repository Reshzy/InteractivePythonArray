import { typeError } from "./errors";
import type { ListItem, PlaygroundError, PythonValue } from "./types";

export const DEFAULT_VARIABLE_NAME = "items";

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function resolveVariableName(name?: string): string {
  if (!name || !IDENTIFIER_PATTERN.test(name)) {
    return DEFAULT_VARIABLE_NAME;
  }

  return name;
}

export type SortKind = PythonValue["type"];

export function getSortKind(list: readonly ListItem[]): SortKind | null {
  if (list.length === 0) {
    return "number";
  }

  const firstType = list[0]?.value.type;
  if (!firstType) {
    return null;
  }

  const homogeneous = list.every((item) => item.value.type === firstType);
  return homogeneous ? firstType : null;
}

export function comparePythonValues(a: PythonValue, b: PythonValue): number {
  if (a.type !== b.type) {
    throw new Error("comparePythonValues requires homogeneous types");
  }

  switch (a.type) {
    case "string": {
      if (b.type !== "string") {
        throw new Error("comparePythonValues requires homogeneous types");
      }
      if (a.value === b.value) {
        return 0;
      }
      return a.value < b.value ? -1 : 1;
    }
    case "number": {
      if (b.type !== "number") {
        throw new Error("comparePythonValues requires homogeneous types");
      }
      return a.value - b.value;
    }
    case "boolean": {
      if (b.type !== "boolean") {
        throw new Error("comparePythonValues requires homogeneous types");
      }
      return Number(a.value) - Number(b.value);
    }
    case "none":
      return 0;
  }
}

export function unsupportedSortError(): PlaygroundError {
  return typeError(
    "'<' not supported between instances of mixed types",
    "Python cannot sort this list because it mixes types that cannot be compared.",
    "Sort a list of only numbers, only strings, or only booleans.",
  );
}

export function integerIndexError(method: "insert" | "pop"): PlaygroundError {
  return typeError(
    `${method} index must be an integer`,
    "Python list indices must be whole numbers.",
    "Enter a whole number such as 0, 1, or -1.",
  );
}
