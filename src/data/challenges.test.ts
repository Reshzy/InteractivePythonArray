import { describe, expect, it } from "vitest";

import { pythonValueEquals } from "@/lib/python/values";

import {
  CHALLENGE_IDS,
  CHALLENGES,
  getAdjacentChallengeId,
  getChallenge,
  isChallengeId,
} from "./challenges";

const REQUIRED_CONCEPTS = [
  "append",
  "insert",
  "pop",
  "remove",
  "clear",
  "count",
  "index",
  "reverse",
  "sort",
  "extend",
  "len",
  "copy",
] as const;

describe("challenge catalog", () => {
  it("has unique ids and 10–15 challenges", () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(10);
    expect(CHALLENGES.length).toBeLessThanOrEqual(15);
    expect(new Set(CHALLENGE_IDS).size).toBe(CHALLENGES.length);
  });

  it("covers the required methods", () => {
    const concepts = new Set(CHALLENGES.map((challenge) => challenge.concept));
    for (const concept of REQUIRED_CONCEPTS) {
      expect(concepts.has(concept)).toBe(true);
    }
  });

  it("keeps setup lists aligned with the initial list", () => {
    for (const challenge of CHALLENGES) {
      expect(challenge.setup.variableName).toBe(challenge.variableName);
      expect(challenge.setup.list).toHaveLength(challenge.initialList.length);
      challenge.initialList.forEach((value, index) => {
        const setupValue = challenge.setup.list[index];
        expect(setupValue).toBeDefined();
        if (setupValue) {
          expect(pythonValueEquals(value, setupValue)).toBe(true);
        }
      });
      expect(challenge.prompt.length).toBeGreaterThan(0);
      expect(challenge.explanation.length).toBeGreaterThan(0);
    }
  });

  it("looks up challenges and wraps adjacent navigation", () => {
    expect(isChallengeId("append-four")).toBe(true);
    expect(isChallengeId("missing")).toBe(false);
    expect(getChallenge("pop-last").expectedMethod).toBe("pop");
    expect(getAdjacentChallengeId("append-four", -1)).toBe("copy-fruits");
    expect(getAdjacentChallengeId("copy-fruits", 1)).toBe("append-four");
    expect(getAdjacentChallengeId("append-four", 1)).toBe("insert-mango");
  });
});
