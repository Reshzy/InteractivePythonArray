import type { MethodId } from "@/lib/python/types";
import { pythonNumber, pythonString } from "@/lib/python/values";

import type { MethodTryIt } from "@/data/methods";

export type ComparisonCell = {
  text: string;
  emphasized?: boolean;
};

export type ComparisonSide = {
  title: string;
  code: string;
  result: string;
  cells: readonly ComparisonCell[];
  mutates: boolean;
  returns: string;
  tryMethod?: MethodId;
  tryIt?: MethodTryIt;
};

export type ComparisonLesson = {
  id: string;
  left: ComparisonSide;
  right: ComparisonSide;
  summary: string;
  teachingPoints: readonly string[];
  searchTerms: readonly string[];
};

export const COMPARISONS: readonly ComparisonLesson[] = [
  {
    id: "append-extend",
    summary: "One item versus every item from another list.",
    searchTerms: ["append", "extend", "add", "nested"],
    teachingPoints: [
      "append() adds exactly one item, even if that item is another list.",
      "extend() walks another list and adds each value individually.",
    ],
    left: {
      title: "append()",
      code: `a = [1, 2]
a.append([3, 4])`,
      result: "[1, 2, [3, 4]]",
      cells: [
        { text: "1" },
        { text: "2" },
        { text: "[3, 4]", emphasized: true },
      ],
      mutates: true,
      returns: "None",
      tryMethod: "append",
      tryIt: {
        variableName: "a",
        list: [pythonNumber(1), pythonNumber(2)],
        value: pythonNumber(3),
      },
    },
    right: {
      title: "extend()",
      code: `a = [1, 2]
a.extend([3, 4])`,
      result: "[1, 2, 3, 4]",
      cells: [
        { text: "1" },
        { text: "2" },
        { text: "3", emphasized: true },
        { text: "4", emphasized: true },
      ],
      mutates: true,
      returns: "None",
      tryMethod: "extend",
      tryIt: {
        variableName: "a",
        list: [pythonNumber(1), pythonNumber(2)],
        values: [pythonNumber(3), pythonNumber(4)],
      },
    },
  },
  {
    id: "remove-pop",
    summary: "Match a value, or remove by index and get it back.",
    searchTerms: ["remove", "pop", "delete"],
    teachingPoints: [
      "remove() looks up a value. pop() looks up an index.",
      "pop() returns the removed item. remove() returns None.",
    ],
    left: {
      title: "remove()",
      code: `fruits = ["apple", "banana", "orange"]
fruits.remove("banana")`,
      result: `["apple", "orange"]`,
      cells: [{ text: '"apple"' }, { text: '"orange"' }],
      mutates: true,
      returns: "None",
      tryMethod: "remove",
      tryIt: {
        variableName: "fruits",
        list: [
          pythonString("apple"),
          pythonString("banana"),
          pythonString("orange"),
        ],
        value: pythonString("banana"),
      },
    },
    right: {
      title: "pop()",
      code: `fruits = ["apple", "banana", "orange"]
removed = fruits.pop(1)`,
      result: `"banana"`,
      cells: [{ text: '"apple"' }, { text: '"orange"' }],
      mutates: true,
      returns: "item",
      tryMethod: "pop",
      tryIt: {
        variableName: "fruits",
        list: [
          pythonString("apple"),
          pythonString("banana"),
          pythonString("orange"),
        ],
        indexText: "1",
      },
    },
  },
  {
    id: "sort-sorted",
    summary: "Change the list in place, or build a new ordered list.",
    searchTerms: ["sort", "sorted", "order", "reorder"],
    teachingPoints: [
      "list.sort() changes the existing list and returns None.",
      "sorted(list) returns a new sorted list and leaves the original alone.",
    ],
    left: {
      title: "sort()",
      code: `numbers = [8, 3, 12, 1]
numbers.sort()`,
      result: "[1, 3, 8, 12]",
      cells: [
        { text: "1", emphasized: true },
        { text: "3", emphasized: true },
        { text: "8", emphasized: true },
        { text: "12", emphasized: true },
      ],
      mutates: true,
      returns: "None",
      tryMethod: "sort",
      tryIt: {
        variableName: "numbers",
        list: [
          pythonNumber(8),
          pythonNumber(3),
          pythonNumber(12),
          pythonNumber(1),
        ],
        reverse: false,
      },
    },
    right: {
      title: "sorted()",
      code: `numbers = [8, 3, 12, 1]
ordered = sorted(numbers)`,
      result: "[1, 3, 8, 12]",
      cells: [
        { text: "8" },
        { text: "3" },
        { text: "12" },
        { text: "1" },
      ],
      mutates: false,
      returns: "list",
      tryMethod: "sorted",
      tryIt: {
        variableName: "numbers",
        list: [
          pythonNumber(8),
          pythonNumber(3),
          pythonNumber(12),
          pythonNumber(1),
        ],
        reverse: false,
      },
    },
  },
  {
    id: "copy-assignment",
    summary: "A new list versus another name for the same list.",
    searchTerms: ["copy", "assignment", "reference", "alias"],
    teachingPoints: [
      "b = a means both names refer to the same list.",
      "b = a.copy() creates a new list with the same items.",
    ],
    left: {
      title: "copy()",
      code: `a = ["apple", "banana"]
b = a.copy()`,
      result: "b is a new list",
      cells: [{ text: '"apple"' }, { text: '"banana"' }],
      mutates: false,
      returns: "list",
      tryMethod: "copy",
      tryIt: {
        variableName: "a",
        list: [pythonString("apple"), pythonString("banana")],
      },
    },
    right: {
      title: "assignment",
      code: `a = ["apple", "banana"]
b = a`,
      result: "a and b are the same list",
      cells: [{ text: '"apple"' }, { text: '"banana"' }],
      mutates: false,
      returns: "same list",
    },
  },
  {
    id: "index-count",
    summary: "Find the first match, or count every match.",
    searchTerms: ["index", "count", "search", "find"],
    teachingPoints: [
      "index() returns the first matching position.",
      "count() returns how many times the value appears.",
    ],
    left: {
      title: "index()",
      code: `letters = ["A", "B", "A"]
letters.index("A")`,
      result: "0",
      cells: [
        { text: '"A"', emphasized: true },
        { text: '"B"' },
        { text: '"A"' },
      ],
      mutates: false,
      returns: "int",
      tryMethod: "index",
      tryIt: {
        variableName: "letters",
        list: [pythonString("A"), pythonString("B"), pythonString("A")],
        value: pythonString("A"),
      },
    },
    right: {
      title: "count()",
      code: `letters = ["A", "B", "A"]
letters.count("A")`,
      result: "2",
      cells: [
        { text: '"A"', emphasized: true },
        { text: '"B"' },
        { text: '"A"', emphasized: true },
      ],
      mutates: false,
      returns: "int",
      tryMethod: "count",
      tryIt: {
        variableName: "letters",
        list: [pythonString("A"), pythonString("B"), pythonString("A")],
        value: pythonString("A"),
      },
    },
  },
] as const;

export const COMPARISON_PREVIEWS = COMPARISONS;

export function getComparison(id: string): ComparisonLesson {
  const comparison = COMPARISONS.find((item) => item.id === id);
  if (!comparison) {
    throw new Error(`Unknown comparison: ${id}`);
  }
  return comparison;
}
