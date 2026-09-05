import type { ListItem, PythonValue } from "./types";

export function pythonString(value: string): PythonValue {
  return { type: "string", value };
}

export function pythonNumber(value: number): PythonValue {
  return { type: "number", value };
}

export function pythonBoolean(value: boolean): PythonValue {
  return { type: "boolean", value };
}

export function pythonNone(): PythonValue {
  return { type: "none", value: null };
}

export function clonePythonValue(value: PythonValue): PythonValue {
  return { ...value };
}

export function cloneListItem(item: ListItem): ListItem {
  return {
    id: item.id,
    value: clonePythonValue(item.value),
  };
}

export function cloneList(list: readonly ListItem[]): ListItem[] {
  return list.map(cloneListItem);
}

export function createListItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `item_${Date.now().toString(36)}_${Math.random().toString(16).slice(2)}`;
}

export function createListItem(value: PythonValue, id = createListItemId()): ListItem {
  return {
    id,
    value: clonePythonValue(value),
  };
}

export function createList(values: readonly PythonValue[]): ListItem[] {
  return values.map((value) => createListItem(value));
}

export function pythonValueEquals(a: PythonValue, b: PythonValue): boolean {
  if (a.type !== b.type) {
    return false;
  }

  return a.value === b.value;
}

export function listValues(list: readonly ListItem[]): PythonValue[] {
  return list.map((item) => clonePythonValue(item.value));
}

export function listIds(list: readonly ListItem[]): string[] {
  return list.map((item) => item.id);
}
