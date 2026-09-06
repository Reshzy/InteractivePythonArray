import { describe, expect, it } from "vitest";

import { getChallenge } from "@/data/challenges";
import { createList, executeOperation, pythonNumber } from "@/lib/python";

import {
  createChallengesStore,
  parsePersistedChallengesState,
} from "./challenges-store";

describe("challenges store", () => {
  it("starts on the first challenge with empty progress", () => {
    const store = createChallengesStore();
    expect(store.getState().currentChallengeId).toBe("append-four");
    expect(store.getState().completedIds).toEqual([]);
    expect(store.getState().hintVisible).toBe(false);
    expect(store.getState().lastVerdict.status).toBe("idle");
  });

  it("wraps next and previous and clears the attempt", () => {
    const store = createChallengesStore();
    store.getState().revealHint();
    store.getState().goNext();

    expect(store.getState().currentChallengeId).toBe("insert-mango");
    expect(store.getState().hintVisible).toBe(false);

    store.getState().selectChallenge("copy-fruits");
    store.getState().goNext();
    expect(store.getState().currentChallengeId).toBe("append-four");

    store.getState().goPrevious();
    expect(store.getState().currentChallengeId).toBe("copy-fruits");
  });

  it("records completion without un-completing later misses", () => {
    const store = createChallengesStore();
    const challenge = getChallenge("append-four");
    const list = createList(challenge.initialList);
    const correct = executeOperation({
      method: "append",
      list,
      variableName: challenge.variableName,
      args: { value: pythonNumber(4) },
    });

    store.getState().recordAttempt("append-four", {
      method: "append",
      after: correct.after,
      result: correct,
    });

    expect(store.getState().completedIds).toEqual(["append-four"]);
    expect(store.getState().lastVerdict.status).toBe("correct");

    const wrong = executeOperation({
      method: "append",
      list: createList(challenge.initialList),
      variableName: challenge.variableName,
      args: { value: pythonNumber(9) },
    });

    store.getState().recordAttempt("append-four", {
      method: "append",
      after: wrong.after,
      result: wrong,
    });

    expect(store.getState().completedIds).toEqual(["append-four"]);
    expect(store.getState().lastVerdict.status).toBe("incorrect");
  });

  it("resetting an attempt keeps completion and hides the hint", () => {
    const store = createChallengesStore();
    store.getState().revealHint();
    const challenge = getChallenge("clear-shelf");
    const result = executeOperation({
      method: "clear",
      list: createList(challenge.initialList),
      variableName: challenge.variableName,
    });

    store.getState().recordAttempt("clear-shelf", {
      method: "clear",
      after: result.after,
      result,
    });
    store.getState().clearAttempt();

    expect(store.getState().completedIds).toEqual(["clear-shelf"]);
    expect(store.getState().hintVisible).toBe(false);
    expect(store.getState().lastVerdict.status).toBe("idle");
  });
});

describe("parsePersistedChallengesState", () => {
  it("drops unknown ids and falls back to the default challenge", () => {
    expect(parsePersistedChallengesState(null)).toBeNull();
    expect(
      parsePersistedChallengesState({
        currentChallengeId: "missing",
        completedIds: ["append-four", "not-a-challenge", "copy-fruits"],
      }),
    ).toEqual({
      currentChallengeId: "append-four",
      completedIds: ["append-four", "copy-fruits"],
    });
  });

  it("accepts a versioned persist payload", () => {
    expect(
      parsePersistedChallengesState({
        state: {
          currentChallengeId: "pop-last",
          completedIds: ["pop-last"],
        },
      }),
    ).toEqual({
      currentChallengeId: "pop-last",
      completedIds: ["pop-last"],
    });
  });
});
