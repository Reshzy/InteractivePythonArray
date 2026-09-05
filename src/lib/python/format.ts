import type { ListItem, PythonValue } from "./types";

function isListItem(item: ListItem | PythonValue): item is ListItem {
  return "id" in item;
}

function escapePythonString(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t");
}

function formatPythonNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(value);
}

export function formatPythonValue(value: PythonValue): string {
  switch (value.type) {
    case "string":
      return `"${escapePythonString(value.value)}"`;
    case "number":
      return formatPythonNumber(value.value);
    case "boolean":
      return value.value ? "True" : "False";
    case "none":
      return "None";
  }
}

export function formatPythonList(
  items: readonly (ListItem | PythonValue)[],
): string {
  const formatted = items.map((item) =>
    formatPythonValue(isListItem(item) ? item.value : item),
  );

  return `[${formatted.join(", ")}]`;
}
