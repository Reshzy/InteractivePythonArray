import type { MethodId, PythonValue } from "@/lib/python/types";
import {
  pythonNumber,
  pythonString,
} from "@/lib/python/values";

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

export type MethodExample = {
  setup: string;
  call: string;
  result: string;
};

export type MethodTryIt = {
  variableName: string;
  list: readonly PythonValue[];
  value?: PythonValue;
  values?: readonly PythonValue[];
  indexText?: string;
  reverse?: boolean;
};

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
  example: MethodExample;
  complexity: string;
  advanced: readonly string[];
  tryIt: MethodTryIt;
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
  description: "The value this method will add, find, or remove.",
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

const FRUITS_LIST = [
  pythonString("apple"),
  pythonString("banana"),
  pythonString("orange"),
] as const;

const NUMBERS_LIST = [
  pythonNumber(8),
  pythonNumber(3),
  pythonNumber(12),
  pythonNumber(1),
] as const;

const DUPLICATES_LIST = [
  pythonString("A"),
  pythonString("B"),
  pythonString("A"),
  pythonString("C"),
  pythonString("A"),
] as const;

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

export function isBuiltinOperation(method: MethodDefinition): boolean {
  return method.category === "builtin";
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: "len(fruits)",
      result: "3",
    },
    complexity: "Average O(1)",
    advanced: [
      "len() is a built-in function, not a list method. Write len(fruits), not fruits.len().",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
    },
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
    example: {
      setup: "numbers = [8, 3, 12, 1]",
      call: "sorted(numbers)",
      result: "[1, 3, 8, 12]",
    },
    complexity: "Average O(n log n)",
    advanced: [
      "sorted() is a built-in. It returns a new list and leaves the original unchanged.",
      "Python cannot sort mixed types such as numbers and strings together.",
    ],
    tryIt: {
      variableName: "numbers",
      list: NUMBERS_LIST,
      reverse: false,
    },
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
    explanation:
      "append() adds a single value to the end. It returns None — no new value, because the list itself changed.",
    mutates: true,
    returnType: "None",
    difficulty: "beginner",
    argumentSchema: [VALUE_ARGUMENT],
    example: {
      setup: `fruits = ["apple", "banana"]`,
      call: `fruits.append("mango")`,
      result: `["apple", "banana", "mango"]`,
    },
    complexity: "Average O(1)",
    advanced: [
      "append() adds exactly one item. If that item is itself a list, the whole list becomes one nested item.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
      value: pythonString("mango"),
    },
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
    example: {
      setup: `fruits = ["apple", "banana"]`,
      call: `fruits.extend(["kiwi", "grape"])`,
      result: `["apple", "banana", "kiwi", "grape"]`,
    },
    complexity: "Average O(k), where k is the number of added items",
    advanced: [
      "extend() walks an iterable and appends each value. It does not add the iterable as one nested item.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
      values: [pythonString("kiwi"), pythonString("grape")],
    },
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
    example: {
      setup: `fruits = ["apple", "orange"]`,
      call: `fruits.insert(1, "banana")`,
      result: `["apple", "banana", "orange"]`,
    },
    complexity: "Average O(n)",
    advanced: [
      "Negative indices count from the end. An index past the end appends, and a very negative index inserts at the start.",
      "Items at and after the insertion point shift right.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
      indexText: "1",
      value: pythonString("kiwi"),
    },
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: `fruits.remove("banana")`,
      result: `["apple", "orange"]`,
    },
    complexity: "Average O(n)",
    advanced: [
      "remove() deletes only the first match and returns None.",
      "A missing value raises ValueError.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
      value: pythonString("banana"),
    },
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: "fruits.pop()",
      result: `"orange"`,
    },
    complexity: "Average O(1) at the end, O(n) otherwise",
    advanced: [
      "With no argument, pop() removes the last item.",
      "Negative indices count from the end. An empty list or out-of-range index raises IndexError.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
      indexText: "",
    },
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: "fruits.clear()",
      result: "[]",
    },
    complexity: "Average O(n)",
    advanced: [
      "clear() empties the existing list in place. Other names for the same list also see the empty result.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
    },
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
    example: {
      setup: `letters = ["A", "B", "A", "C", "A"]`,
      call: `letters.count("A")`,
      result: "3",
    },
    complexity: "Average O(n)",
    advanced: [
      "count() returns 0 when the value is missing. It does not raise an error.",
    ],
    tryIt: {
      variableName: "letters",
      list: DUPLICATES_LIST,
      value: pythonString("A"),
    },
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
    example: {
      setup: `letters = ["A", "B", "A", "C", "A"]`,
      call: `letters.index("A")`,
      result: "0",
    },
    complexity: "Average O(n)",
    advanced: [
      "index() returns only the first match.",
      "A missing value raises ValueError. Use count() if you only need to know whether it appears.",
    ],
    tryIt: {
      variableName: "letters",
      list: DUPLICATES_LIST,
      value: pythonString("A"),
    },
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: "fruits.reverse()",
      result: `["orange", "banana", "apple"]`,
    },
    complexity: "Average O(n)",
    advanced: [
      "reverse() changes the existing list and returns None. It does not create a new list.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
    },
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
    example: {
      setup: "numbers = [8, 3, 12, 1]",
      call: "numbers.sort()",
      result: "[1, 3, 8, 12]",
    },
    complexity: "Average O(n log n)",
    advanced: [
      "sort() changes the existing list and returns None.",
      "Python cannot sort mixed types such as numbers and strings together.",
    ],
    tryIt: {
      variableName: "numbers",
      list: NUMBERS_LIST,
      reverse: false,
    },
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
    example: {
      setup: `fruits = ["apple", "banana", "orange"]`,
      call: "copied = fruits.copy()",
      result: `["apple", "banana", "orange"]`,
    },
    complexity: "Average O(n)",
    advanced: [
      "copy() is a shallow copy: the new list is separate, but nested objects would still be shared. This playground does not nest lists.",
      "b = a does not copy. Both names then refer to the same list.",
    ],
    tryIt: {
      variableName: "fruits",
      list: FRUITS_LIST,
    },
    commonMistakes: [
      "Assigning another_name = items does not copy the list. Both names would refer to the same list.",
    ],
    comparisonWith: ["assignment"],
  },
];
