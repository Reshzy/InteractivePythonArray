export type MethodCategory =
  | "builtin"
  | "add"
  | "remove"
  | "search"
  | "reorder"
  | "utility";

export type MethodDefinition = {
  id: string;
  label: string;
  category: MethodCategory;
  syntax: string;
  shortDescription: string;
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

export const METHODS: readonly MethodDefinition[] = [
  {
    id: "len",
    label: "len()",
    category: "builtin",
    syntax: "len(list)",
    shortDescription: "Returns the number of items in a list.",
  },
  {
    id: "append",
    label: "append()",
    category: "add",
    syntax: "list.append(value)",
    shortDescription: "Adds one item to the end of a list.",
  },
  {
    id: "extend",
    label: "extend()",
    category: "add",
    syntax: "list.extend(iterable)",
    shortDescription: "Adds each item from another list.",
  },
  {
    id: "insert",
    label: "insert()",
    category: "add",
    syntax: "list.insert(index, value)",
    shortDescription: "Inserts an item at a chosen index.",
  },
  {
    id: "remove",
    label: "remove()",
    category: "remove",
    syntax: "list.remove(value)",
    shortDescription: "Removes the first matching value.",
  },
  {
    id: "pop",
    label: "pop()",
    category: "remove",
    syntax: "list.pop(index)",
    shortDescription: "Removes an item by index and returns it.",
  },
  {
    id: "clear",
    label: "clear()",
    category: "remove",
    syntax: "list.clear()",
    shortDescription: "Removes every item from the list.",
  },
  {
    id: "count",
    label: "count()",
    category: "search",
    syntax: "list.count(value)",
    shortDescription: "Counts how many times a value appears.",
  },
  {
    id: "index",
    label: "index()",
    category: "search",
    syntax: "list.index(value)",
    shortDescription: "Returns the first index of a value.",
  },
  {
    id: "reverse",
    label: "reverse()",
    category: "reorder",
    syntax: "list.reverse()",
    shortDescription: "Reverses the list in place.",
  },
  {
    id: "sort",
    label: "sort()",
    category: "reorder",
    syntax: "list.sort()",
    shortDescription: "Sorts the list in place.",
  },
  {
    id: "copy",
    label: "copy()",
    category: "utility",
    syntax: "list.copy()",
    shortDescription: "Creates a new list with the same items.",
  },
] as const;

