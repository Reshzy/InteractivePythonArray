import { describe, expect, it } from "vitest";

import { getChallenge } from "@/data/challenges";
import { createList, executeOperation, pythonNumber, pythonString } from "@/lib/python";

import { evaluateChallenge, pythonValuesEqual } from "./evaluate";

describe("evaluateChallenge", () => {
  it("accepts a correct append", () => {
    const challenge = getChallenge("append-four");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "append",
      list,
      variableName: challenge.variableName,
      args: { value: pythonNumber(4) },
    });

    expect(evaluateChallenge(challenge, {
      method: "append",
      after: result.after,
      result,
    }).status).toBe("correct");
  });

  it("rejects a wrong final list", () => {
    const challenge = getChallenge("append-four");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "append",
      list,
      variableName: challenge.variableName,
      args: { value: pythonNumber(9) },
    });

    const verdict = evaluateChallenge(challenge, {
      method: "append",
      after: result.after,
      result,
    });

    expect(verdict.status).toBe("incorrect");
    expect(verdict.message).toContain("compare it with the goal");
  });

  it("rejects the right list from the wrong method", () => {
    const challenge = getChallenge("remove-first-apple");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "pop",
      list,
      variableName: challenge.variableName,
      args: { index: 0 },
    });

    const verdict = evaluateChallenge(challenge, {
      method: "pop",
      after: result.after,
      result,
    });

    expect(verdict.status).toBe("incorrect");
    expect(verdict.message).toContain("remove()");
  });

  it("requires the expected return value", () => {
    const challenge = getChallenge("pop-last");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "pop",
      list,
      variableName: challenge.variableName,
      args: { index: 0 },
    });

    const verdict = evaluateChallenge(challenge, {
      method: "pop",
      after: result.after,
      result,
    });

    expect(verdict.status).toBe("incorrect");
  });

  it("accepts pop() of the last item and its return value", () => {
    const challenge = getChallenge("pop-last");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "pop",
      list,
      variableName: challenge.variableName,
    });

    expect(evaluateChallenge(challenge, {
      method: "pop",
      after: result.after,
      result,
    })).toMatchObject({
      status: "correct",
      title: "Correct",
    });
  });

  it("treats engine errors as not solved", () => {
    const challenge = getChallenge("index-banana");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "index",
      list,
      variableName: challenge.variableName,
      args: { value: pythonString("kiwi") },
    });

    const verdict = evaluateChallenge(challenge, {
      method: "index",
      after: result.after,
      result,
    });

    expect(result.error).toBeDefined();
    expect(verdict.status).toBe("incorrect");
    expect(verdict.title).toBe("Not quite yet.");
    expect(verdict.message.length).toBeGreaterThan(0);
  });

  it("accepts copy() when the returned list matches the start list", () => {
    const challenge = getChallenge("copy-fruits");
    const list = createList(challenge.initialList);
    const result = executeOperation({
      method: "copy",
      list,
      variableName: challenge.variableName,
    });

    expect(evaluateChallenge(challenge, {
      method: "copy",
      after: result.after,
      result,
    }).status).toBe("correct");
  });

  it("compares Python values without using item ids", () => {
    expect(
      pythonValuesEqual(
        [pythonString("apple"), pythonNumber(1)],
        [pythonString("apple"), pythonNumber(1)],
      ),
    ).toBe(true);
    expect(
      pythonValuesEqual([pythonString("1")], [pythonNumber(1)]),
    ).toBe(false);
  });
});
