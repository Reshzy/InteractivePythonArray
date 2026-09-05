export type ComparisonPreview = {
  id: string;
  left: string;
  right: string;
  summary: string;
};

export const COMPARISON_PREVIEWS: readonly ComparisonPreview[] = [
  {
    id: "append-extend",
    left: "append()",
    right: "extend()",
    summary: "One item versus every item from another list.",
  },
  {
    id: "remove-pop",
    left: "remove()",
    right: "pop()",
    summary: "Match a value, or remove by index and get it back.",
  },
  {
    id: "sort-sorted",
    left: "sort()",
    right: "sorted()",
    summary: "Change the list in place, or build a new ordered list.",
  },
  {
    id: "copy-assignment",
    left: "copy()",
    right: "assignment",
    summary: "A new list versus another name for the same list.",
  },
  {
    id: "index-count",
    left: "index()",
    right: "count()",
    summary: "Find the first match, or count every match.",
  },
] as const;
