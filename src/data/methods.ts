import type { MethodId } from "@/lib/python/types";

export type MethodCategory =
  | "builtin"
  | "add"
  | "remove"
  | "search"
  | "reorder"
  | "utility";

export type ArgumentKind = "value" | "index" | "values" | "boolean";

export type ArgumentDefinition = {
  name: string;
  label: string;
  kind: ArgumentKind;
  required: boolean;
  description: string;
};

export type MethodDifficulty = "beginner" | "intermediate";

export type MethodDefinition = {
  id: MethodId;
  label: string;
  category: MethodCategory;
  syntax: string;
  shortDescription: string;
  explanation: string;
  mutates: boolean;
  returnType: string;
  difficulty: MethodDifficulty;
  argumentSchema: ArgumentDefinition[];
  commonMistakes?: string[];
  comparisonWith?: string[];
};

export const METHOD_CATEGORIES: readonly {
  id: MethodCategory;
  label: string;
}[] = [
  { id: "builtin", label: "Built-ins" },
  { id: "add", label: "Add" },
  { id: "remove", label: "Remove" },
  { id: "search", label: "Search" },
  { id: "reorder", label: "Reorder" },
  { id: "utility", label: "Utility" },
] as const;

const VALUE_ARGUMENT: ArgumentDefinition = {
  name: "value",
  label: "Value",
  kind: "value",
  required: true,
  description: "The Python value to use with this operation.",
};

const INDEX_ARGUMENT: ArgumentDefinition = {
  name: "index",
  label: "Index",
  kind: "index",
  required: true,
  description: "The list position to use. Negative indices count from the end.",
};

const OPTIONAL_INDEX_ARGUMENT: ArgumentDefinition = {
  name: "index",
  label: "Index",
  kind: "index",
  required: false,
  description: "Optional position to remove. Defaults to the last item.",
};

const VALUES_ARGUMENT: ArgumentDefinition = {
  name: "values",
  label: "Items",
  kind: "values",
  required: true,
  description: "The items to add one by one from another list.",
};

const REVERSE_ARGUMENT: ArgumentDefinition = {
  name: "reverse",
  label: "Reverse",
  kind: "boolean",
  required: false,
  description: "When True, sort from largest to smallest.",
};

export function isMethodId(value: unknown): value is MethodId {
  return typeof value === "string" && METHODS.some((method) => method.id === value);
}

export function getMethod(id: MethodId): MethodDefinition {
  const method = METHODS.find((item) => item.id === id);
  if (!method) {
    throw new Error(`Unknown method: ${id}`);
  }
  return method;
}

export const METHODS: readonly MethodDefinition[] = [
  {
    id: "len",
    label: "len()",
    category: "builtin",
    syntax: "len(list)",
    shortDescription: "Returns the number of items in a list.",
    explanation: "len() is a built-in. It counts the items and leaves the list unchanged.",
    mutates: false,
    returnType: "int",
    difficulty: "beginner",
    argumentSchema: [],
  },
  {
    id: "sorted",
    label: "sorted()",
    category: "builtin",
    syntax: "sorted(list)",
    shortDescription: "Returns a new sorted list without changing the original.",
    explanation:
      "sorted() builds a new ordered list. The original list stays the same.",
    mutates: false,
    returnType: "list",
    difficulty: "intermediate",
    argumentSchema: [REVERSE_ARGUMENT],
    commonMistakes: [
      "sorted() does not change the original list. Assign the result if you need it.",
    ],
    comparisonWith: ["sort"],
  },
  {
    id: "append",
    label: "append()",
    category: "add",
    syntax: "list.append(value)",
    shortDescription: "Adds one item to the end of a list.",
    explanation: "append() adds a single value to the end and returns None.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [VALUE_ARGUMENT],
    commonMistakes: [
      "append() adds one item. Use extend() to add each item from another list.",
    ],
    comparisonWith: ["extend"],
  },
  {
    id: "extend",
    label: "extend()",
    category: "add",
    syntax: "list.extend(iterable)",
    shortDescription: "Adds each item from another list.",
    explanation:
      "extend() walks another list and appends each value individually.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [VALUES_ARGUMENT],
    commonMistakes: [
      "extend() is not the same as append(). append() would add the whole list as one item.",
    ],
    comparisonWith: ["append"],
  },
  {
    id: "insert",
    label: "insert()",
    category: "add",
    syntax: "list.insert(index, value)",
    shortDescription: "Inserts an item at a chosen index.",
    explanation:
      "insert() places a value at a position. Items at and after that index shift right.",
    mutates: true,
    returnType: "None",
    difficulty: "intermediate",
    argumentSchema: [INDEX_ARGUMENT, VALUE_ARGUMENT],
  },
  {
    id: "remove",
    label: "remove()",
    category: "remove",
    syntax: "list.remove(value)",
    shortDescription: "Removes the first matching value.",
    explanation:
      "remove() scans from the left and deletes only the first matching value.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [VALUE_ARGUMENT],
    commonMistakes: [
      "remove() needs a matching value. Use pop() if you know the index instead.",
    ],
    comparisonWith: ["pop"],
  },
  {
    id: "pop",
    label: "pop()",
    category: "remove",
    syntax: "list.pop(index)",
    shortDescription: "Removes an item by index and returns it.",
    explanation:
      "pop() removes an item by index (the last item by default) and returns that value.",
    mutates: true,
    returnType: "item",
    difficulty: "beginner",
    argumentSchema: [OPTIONAL_INDEX_ARGUMENT],
    comparisonWith: ["remove"],
  },
  {
    id: "clear",
    label: "clear()",
    category: "remove",
    syntax: "list.clear()",
    shortDescription: "Removes every item from the list.",
    explanation: "clear() empties the list in place and returns None.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [],
  },
  {
    id: "count",
    label: "count()",
    category: "search",
    syntax: "list.count(value)",
    shortDescription: "Counts how many times a value appears.",
    explanation: "count() scans the whole list and returns how many items match.",
    mutates: false,
    returnType: "int",
    difficulty: "beginner",
    argumentSchema: [VALUE_ARGUMENT],
    comparisonWith: ["index"],
  },
  {
    id: "index",
    label: "index()",
    category: "search",
    syntax: "list.index(value)",
    shortDescription: "Returns the first index of a value.",
    explanation:
      "index() scans from the left and returns the first matching position.",
    mutates: false,
    returnType: "int",
    difficulty: "beginner",
    argumentSchema: [VALUE_ARGUMENT],
    commonMistakes: [
      "index() raises ValueError if the value is not in the list.",
    ],
    comparisonWith: ["count"],
  },
  {
    id: "reverse",
    label: "reverse()",
    category: "reorder",
    syntax: "list.reverse()",
    shortDescription: "Reverses the list in place.",
    explanation: "reverse() reorders the existing items from last to first.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [],
  },
  {
    id: "sort",
    label: "sort()",
    category: "reorder",
    syntax: "list.sort()",
    shortDescription: "Sorts the list in place.",
    explanation:
      "sort() reorders the current list. Mixed types that Python cannot compare produce a TypeError.",
    mutates: true,
    returnType: "None",
    difficulty: "intermediate",
    argumentSchema: [REVERSE_ARGUMENT],
    commonMistakes: [
      "sort() changes the list and returns None. Use sorted() to keep the original.",
    ],
    comparisonWith: ["sorted"],
  },
  {
    id: "copy",
    label: "copy()",
    category: "utility",
    syntax: "list.copy()",
    shortDescription: "Creates a new list with the same items.",
    explanation:
      "copy() creates a new list with the same values. This playground uses a shallow-copy educational model.",
    mutates: false,
    returnType: "list",
    difficulty: "intermediate",
    argumentSchema: [],
    commonMistakes: [
      "Assigning another_name = items does not copy the list. Both names would refer to the same list.",
    ],
    comparisonWith: ["assignment"],
  },
];
