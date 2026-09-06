import type { MethodTryIt } from "@/data/methods";
import type { MethodId, PythonValue } from "@/lib/python/types";
import { pythonNumber, pythonString } from "@/lib/python/values";

export type ChallengeId =
  | "append-four"
  | "insert-mango"
  | "extend-pair"
  | "remove-first-apple"
  | "pop-last"
  | "pop-index"
  | "clear-shelf"
  | "count-apples"
  | "index-banana"
  | "len-colors"
  | "reverse-countdown"
  | "sort-ascending"
  | "copy-fruits";

export type Challenge = {
  id: ChallengeId;
  title: string;
  prompt: string;
  concept: string;
  variableName: string;
  initialList: readonly PythonValue[];
  targetList?: readonly PythonValue[];
  expectedMethod?: MethodId;
  allowedMethods?: readonly MethodId[];
  expectedReturnValue?: PythonValue | "list-copy";
  setup: MethodTryIt;
  hint?: string;
  explanation: string;
};

const NUMBERS_123 = [
  pythonNumber(1),
  pythonNumber(2),
  pythonNumber(3),
] as const;

const APPLE_ORANGE = [pythonString("apple"), pythonString("orange")] as const;

const EXTEND_START = [pythonNumber(1), pythonNumber(2)] as const;

const APPLES = [
  pythonString("apple"),
  pythonString("banana"),
  pythonString("apple"),
] as const;

const COLORS = [
  pythonString("red"),
  pythonString("green"),
  pythonString("blue"),
] as const;

const LETTERS = [pythonString("A"), pythonString("B"), pythonString("C")] as const;

const SHELF = [pythonString("book"), pythonString("lamp")] as const;

const COUNT_FRUIT = [
  pythonString("apple"),
  pythonString("pear"),
  pythonString("apple"),
] as const;

const INDEX_FRUIT = [
  pythonString("apple"),
  pythonString("banana"),
  pythonString("pear"),
] as const;

const COUNTDOWN = [pythonNumber(9), pythonNumber(7), pythonNumber(5)] as const;

const UNSORTED = [
  pythonNumber(8),
  pythonNumber(3),
  pythonNumber(12),
  pythonNumber(1),
] as const;

const COPY_FRUIT = [pythonString("apple"), pythonString("banana")] as const;

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "append-four",
    title: "Add one value",
    prompt: "Add 4 to the end of the list using append().",
    concept: "append",
    variableName: "numbers",
    initialList: NUMBERS_123,
    targetList: [...NUMBERS_123, pythonNumber(4)],
    expectedMethod: "append",
    setup: {
      variableName: "numbers",
      list: NUMBERS_123,
      value: pythonNumber(4),
    },
    hint: "append() adds exactly one item to the end of the list.",
    explanation: "append() added 4 as a single new item at the end.",
  },
  {
    id: "insert-mango",
    title: "Insert in the middle",
    prompt: 'Insert "mango" at index 1 using insert().',
    concept: "insert",
    variableName: "fruit",
    initialList: APPLE_ORANGE,
    targetList: [pythonString("apple"), pythonString("mango"), pythonString("orange")],
    expectedMethod: "insert",
    setup: {
      variableName: "fruit",
      list: APPLE_ORANGE,
      value: pythonString("mango"),
      indexText: "1",
    },
    hint: "insert(index, value) puts the new item at that index and shifts the rest right.",
    explanation: 'insert() placed "mango" at index 1 and shifted "orange" to the right.',
  },
  {
    id: "extend-pair",
    title: "Add several values",
    prompt: "Add 3 and 4 from another list using extend().",
    concept: "extend",
    variableName: "numbers",
    initialList: EXTEND_START,
    targetList: [pythonNumber(1), pythonNumber(2), pythonNumber(3), pythonNumber(4)],
    expectedMethod: "extend",
    setup: {
      variableName: "numbers",
      list: EXTEND_START,
      values: [pythonNumber(3), pythonNumber(4)],
    },
    hint: "extend() adds each item from another list, not the list as one nested item.",
    explanation: "extend() walked [3, 4] and added each number individually.",
  },
  {
    id: "remove-first-apple",
    title: "Remove the first apple",
    prompt: 'Remove the first "apple" using remove().',
    concept: "remove",
    variableName: "fruit",
    initialList: APPLES,
    targetList: [pythonString("banana"), pythonString("apple")],
    expectedMethod: "remove",
    setup: {
      variableName: "fruit",
      list: APPLES,
      value: pythonString("apple"),
    },
    hint: 'remove() works with a value, while pop() works with an index.',
    explanation: 'remove() deleted only the first matching "apple".',
  },
  {
    id: "pop-last",
    title: "Get the final value",
    prompt: 'Remove and return "blue" using pop() with no index.',
    concept: "pop",
    variableName: "colors",
    initialList: COLORS,
    targetList: [pythonString("red"), pythonString("green")],
    expectedMethod: "pop",
    expectedReturnValue: pythonString("blue"),
    setup: {
      variableName: "colors",
      list: COLORS,
      indexText: "",
    },
    hint: "pop() with an empty index removes and returns the last item.",
    explanation: 'pop() removed the last item and returned "blue".',
  },
  {
    id: "pop-index",
    title: "Pop a specific index",
    prompt: 'Remove and return the item at index 1 using pop().',
    concept: "pop",
    variableName: "letters",
    initialList: LETTERS,
    targetList: [pythonString("A"), pythonString("C")],
    expectedMethod: "pop",
    expectedReturnValue: pythonString("B"),
    setup: {
      variableName: "letters",
      list: LETTERS,
      indexText: "1",
    },
    hint: "pop(index) removes that position and returns the value that lived there.",
    explanation: 'pop(1) removed "B" and closed the gap between "A" and "C".',
  },
  {
    id: "clear-shelf",
    title: "Empty the list",
    prompt: "Remove every item using clear().",
    concept: "clear",
    variableName: "shelf",
    initialList: SHELF,
    targetList: [],
    expectedMethod: "clear",
    setup: {
      variableName: "shelf",
      list: SHELF,
    },
    hint: "clear() empties the list in place and returns None.",
    explanation: "clear() removed every item and left an empty list.",
  },
  {
    id: "count-apples",
    title: "Count the matches",
    prompt: 'Count how many times "apple" appears using count(). The list should not change.',
    concept: "count",
    variableName: "fruit",
    initialList: COUNT_FRUIT,
    targetList: COUNT_FRUIT,
    expectedMethod: "count",
    expectedReturnValue: pythonNumber(2),
    setup: {
      variableName: "fruit",
      list: COUNT_FRUIT,
      value: pythonString("apple"),
    },
    hint: "count() returns a number. It does not change the list.",
    explanation: 'count() found 2 matching "apple" values and left the list unchanged.',
  },
  {
    id: "index-banana",
    title: "Find the first position",
    prompt: 'Find the first index of "banana" using index(). The list should not change.',
    concept: "index",
    variableName: "fruit",
    initialList: INDEX_FRUIT,
    targetList: INDEX_FRUIT,
    expectedMethod: "index",
    expectedReturnValue: pythonNumber(1),
    setup: {
      variableName: "fruit",
      list: INDEX_FRUIT,
      value: pythonString("banana"),
    },
    hint: "index() returns the first matching position, not the item itself.",
    explanation: 'index() returned 1, the first place "banana" appears.',
  },
  {
    id: "len-colors",
    title: "Measure the list",
    prompt: "Find how many items are in the list using len(). The list should not change.",
    concept: "len",
    variableName: "colors",
    initialList: COLORS,
    targetList: COLORS,
    expectedMethod: "len",
    expectedReturnValue: pythonNumber(3),
    setup: {
      variableName: "colors",
      list: COLORS,
    },
    hint: "len() is a built-in function. It returns a number and does not change the list.",
    explanation: "len() counted 3 items and left the list unchanged.",
  },
  {
    id: "reverse-countdown",
    title: "Flip the order",
    prompt: "Reverse the list in place using reverse().",
    concept: "reverse",
    variableName: "countdown",
    initialList: COUNTDOWN,
    targetList: [pythonNumber(5), pythonNumber(7), pythonNumber(9)],
    expectedMethod: "reverse",
    setup: {
      variableName: "countdown",
      list: COUNTDOWN,
    },
    hint: "reverse() flips the existing list. It does not sort the values.",
    explanation: "reverse() flipped the items in place, from last to first.",
  },
  {
    id: "sort-ascending",
    title: "Sort ascending",
    prompt: "Sort the list in ascending order using sort().",
    concept: "sort",
    variableName: "numbers",
    initialList: UNSORTED,
    targetList: [
      pythonNumber(1),
      pythonNumber(3),
      pythonNumber(8),
      pythonNumber(12),
    ],
    expectedMethod: "sort",
    setup: {
      variableName: "numbers",
      list: UNSORTED,
      reverse: false,
    },
    hint: "list.sort() changes the existing list. Leave reverse unchecked for ascending order.",
    explanation: "sort() rearranged the numbers from smallest to largest in place.",
  },
  {
    id: "copy-fruits",
    title: "Make a copy",
    prompt: "Create a new list with the same items using copy(). The original list should stay unchanged.",
    concept: "copy",
    variableName: "fruit",
    initialList: COPY_FRUIT,
    targetList: COPY_FRUIT,
    expectedMethod: "copy",
    expectedReturnValue: "list-copy",
    setup: {
      variableName: "fruit",
      list: COPY_FRUIT,
    },
    hint: "copy() returns a new list. Assignment like b = a would still share the original.",
    explanation: "copy() returned a new list with the same items and left the original unchanged.",
  },
] as const;

export const CHALLENGE_IDS = CHALLENGES.map((challenge) => challenge.id);

export const DEFAULT_CHALLENGE_ID: ChallengeId = "append-four";

export function isChallengeId(value: unknown): value is ChallengeId {
  return typeof value === "string" && CHALLENGE_IDS.some((id) => id === value);
}

export function getChallenge(id: ChallengeId): Challenge {
  const challenge = CHALLENGES.find((item) => item.id === id);
  if (!challenge) {
    throw new Error(`Unknown challenge: ${id}`);
  }
  return challenge;
}

export function getChallengeIndex(id: ChallengeId): number {
  return CHALLENGES.findIndex((challenge) => challenge.id === id);
}

export function getAdjacentChallengeId(
  id: ChallengeId,
  direction: -1 | 1,
): ChallengeId {
  const index = getChallengeIndex(id);
  const nextIndex = (index + direction + CHALLENGES.length) % CHALLENGES.length;
  const next = CHALLENGES[nextIndex];
  if (!next) {
    return id;
  }
  return next.id;
}
