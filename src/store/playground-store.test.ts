import { describe, expect, it } from "vitest";

import { CHALLENGES, getChallenge } from "@/data/challenges";
import { evaluateChallenge } from "@/lib/challenges/evaluate";
import { createDefaultArguments } from "@/lib/playground/arguments";
import { pythonNumber, pythonString } from "@/lib/python/values";
import { parseShareSearchParams } from "@/lib/playground/share";
import {
  canRedo,
  canStepBack,
  canUndo,
  createPlaygroundStore,
  parsePersistedState,
} from "@/store/playground-store";

function ids(store: ReturnType<typeof createPlaygroundStore>) {
  return store.getState().list.map((item) => item.id);
}

describe("playground store", () => {
  it("executes append and records history", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);

    store.getState().executeOperation();

    const state = store.getState();
    expect(state.list).toHaveLength(4);
    expect(state.list.slice(0, 3).map((item) => item.id)).toEqual(originalIds);
    expect(state.list[3]?.value).toEqual(pythonString("mango"));
    expect(state.lastResult?.mutates).toBe(true);
    expect(state.lastResult?.code).toBe('fruits.append("mango")');
    expect(state.history).toHaveLength(1);
    expect(state.historyIndex).toBe(0);
    expect(state.selectedPreset).toBeNull();
    expect(state.presetSource).toBe("fruits");
    expect(state.resultView).toBe("live");
  });

  it("preserves list IDs for non-mutating operations", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);

    store.getState().setSelectedMethod("len");
    store.getState().executeOperation();

    expect(ids(store)).toEqual(originalIds);
    expect(store.getState().lastResult?.mutates).toBe(false);
    expect(store.getState().lastResult?.returnValue).toEqual(pythonNumber(3));
    expect(store.getState().selectedPreset).toBe("fruits");

    store.getState().setSelectedMethod("count");
    store.getState().setValueDraft({
      type: "string",
      text: "apple",
      booleanValue: true,
    });
    store.getState().executeOperation();

    expect(ids(store)).toEqual(originalIds);
    expect(store.getState().lastResult?.returnValue).toEqual(pythonNumber(1));
  });

  it("undoes and redoes from snapshots without re-running the engine", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);

    store.getState().executeOperation();
    const afterAppendIds = ids(store);
    expect(afterAppendIds).toHaveLength(4);

    store.getState().undo();
    expect(ids(store)).toEqual(originalIds);
    expect(store.getState().list).toHaveLength(3);
    expect(store.getState().lastResult?.code).toBe('fruits.append("mango")');
    expect(store.getState().resultView).toBe("undone");
    expect(store.getState().selectedPreset).toBe("fruits");
    expect(canUndo(store.getState())).toBe(false);
    expect(canRedo(store.getState())).toBe(true);

    store.getState().redo();
    expect(ids(store)).toEqual(afterAppendIds);
    expect(store.getState().list[3]?.value).toEqual(pythonString("mango"));
    expect(store.getState().lastResult?.code).toBe('fruits.append("mango")');
    expect(store.getState().resultView).toBe("live");
    expect(store.getState().selectedPreset).toBeNull();
    expect(store.getState().presetSource).toBe("fruits");
  });

  it("truncates the redo branch after a new operation", () => {
    const store = createPlaygroundStore();

    store.getState().executeOperation();
    store.getState().completePlayback();
    store.getState().setValueDraft({
      type: "string",
      text: "kiwi",
      booleanValue: true,
    });
    store.getState().executeOperation();
    store.getState().completePlayback();
    expect(store.getState().history).toHaveLength(2);

    store.getState().undo();
    expect(canRedo(store.getState())).toBe(true);

    store.getState().setValueDraft({
      type: "string",
      text: "pear",
      booleanValue: true,
    });
    store.getState().executeOperation();
    store.getState().completePlayback();

    expect(store.getState().history).toHaveLength(2);
    expect(store.getState().history[1]?.code).toBe('fruits.append("pear")');
    expect(canRedo(store.getState())).toBe(false);
    expect(store.getState().list.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
      pythonString("mango"),
      pythonString("pear"),
    ]);
  });

  it("reset restores the default list and keeps animation speed", () => {
    const store = createPlaygroundStore();
    store.getState().setAnimationSpeed(2);
    store.getState().executeOperation();
    store.getState().loadPreset("numbers");

    store.getState().reset();

    const state = store.getState();
    expect(state.variableName).toBe("fruits");
    expect(state.list.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ]);
    expect(state.selectedMethod).toBe("append");
    expect(state.arguments).toEqual(createDefaultArguments());
    expect(state.history).toEqual([]);
    expect(state.historyIndex).toBe(-1);
    expect(state.lastResult).toBeNull();
    expect(state.animationSpeed).toBe(2);
    expect(state.selectedPreset).toBe("fruits");
    expect(state.presetSource).toBe("fruits");
    expect(state.resultView).toBe("preview");
    expect(state.presetSource).toBe("fruits");
  });

  it("loads presets with new IDs and clears history", () => {
    const store = createPlaygroundStore();
    store.getState().executeOperation();

    store.getState().loadPreset("numbers");

    const state = store.getState();
    expect(state.variableName).toBe("numbers");
    expect(state.list.map((item) => item.value)).toEqual([
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ]);
    expect(state.history).toEqual([]);
    expect(state.lastResult).toBeNull();
    expect(state.selectedPreset).toBe("numbers");
    expect(state.presetSource).toBe("numbers");
    expect(new Set(ids(store)).size).toBe(4);
  });

  it("stores educational errors in history without changing the list", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);

    store.getState().setSelectedMethod("remove");
    store.getState().setValueDraft({
      type: "string",
      text: "kiwi",
      booleanValue: true,
    });
    store.getState().executeOperation();

    const state = store.getState();
    expect(ids(store)).toEqual(originalIds);
    expect(state.lastResult?.error?.type).toBe("ValueError");
    expect(state.history).toHaveLength(1);
    expect(state.list).toHaveLength(3);
  });

  it("turns invalid number input into a TypeError instead of crashing", () => {
    const store = createPlaygroundStore();

    store.getState().setValueDraft({
      type: "number",
      text: "abc",
      booleanValue: true,
    });
    store.getState().executeOperation();

    expect(store.getState().lastResult?.error?.type).toBe("TypeError");
    expect(store.getState().list).toHaveLength(3);
  });

  it("ignores Run while a mutation animation is playing", () => {
    const store = createPlaygroundStore();
    store.getState().executeOperation();

    const afterFirst = ids(store);
    expect(store.getState().isAnimating).toBe(true);
    expect(store.getState().resultRevealed).toBe(false);

    store.getState().executeOperation();
    expect(ids(store)).toEqual(afterFirst);
    expect(store.getState().history).toHaveLength(1);

    store.getState().completePlayback();
    expect(store.getState().isAnimating).toBe(false);
    expect(store.getState().resultRevealed).toBe(true);

    store.getState().executeOperation();
    expect(store.getState().list).toHaveLength(5);
  });

  it("tryMethod loads an example without running the operation", () => {
    const store = createPlaygroundStore();
    store.getState().executeOperation();
    expect(store.getState().list).toHaveLength(4);

    store.getState().tryMethod("append");

    const state = store.getState();
    expect(state.selectedMethod).toBe("append");
    expect(state.variableName).toBe("fruits");
    expect(state.list.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ]);
    expect(state.arguments.value).toEqual({
      type: "string",
      text: "mango",
      booleanValue: true,
    });
    expect(state.lastResult).toBeNull();
    expect(state.isAnimating).toBe(false);
    expect(state.history).toHaveLength(1);
    expect(state.activeChallengeId).toBeNull();
  });

  it("loadChallenge sets the playground without running the engine", () => {
    const store = createPlaygroundStore();
    store.getState().executeOperation();
    expect(store.getState().list).toHaveLength(4);

    const challenge = getChallenge("remove-first-apple");
    store.getState().loadChallenge(challenge);

    const state = store.getState();
    expect(state.activeChallengeId).toBe("remove-first-apple");
    expect(state.selectedMethod).toBe("remove");
    expect(state.variableName).toBe("fruit");
    expect(state.list.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("apple"),
    ]);
    expect(state.arguments.value).toEqual({
      type: "string",
      text: "apple",
      booleanValue: true,
    });
    expect(state.lastResult).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.isAnimating).toBe(false);
  });

  it("reset, presets, and tryMethod leave challenge mode", () => {
    const store = createPlaygroundStore();
    store.getState().loadChallenge(getChallenge("append-four"));
    expect(store.getState().activeChallengeId).toBe("append-four");

    store.getState().loadPreset("numbers");
    expect(store.getState().activeChallengeId).toBeNull();

    store.getState().loadChallenge(getChallenge("append-four"));
    store.getState().tryMethod("len");
    expect(store.getState().activeChallengeId).toBeNull();

    store.getState().loadChallenge(getChallenge("append-four"));
    store.getState().reset();
    expect(store.getState().activeChallengeId).toBeNull();
  });

  it("solves every catalog challenge with one Run after loadChallenge", () => {
    for (const challenge of CHALLENGES) {
      const store = createPlaygroundStore();
      store.getState().loadChallenge(challenge);
      store.getState().executeOperation();

      const state = store.getState();
      expect(state.lastResult, challenge.id).toBeTruthy();
      expect(state.lastResult?.error, challenge.id).toBeUndefined();

      const verdict = evaluateChallenge(challenge, {
        method: state.selectedMethod,
        after: state.list,
        result: state.lastResult!,
      });
      expect(verdict.status, challenge.id).toBe("correct");
    }
  });

  it("loadSharedState restores a snapshot and clears history", () => {
    const store = createPlaygroundStore();
    store.getState().executeOperation();

    const parsed = parseShareSearchParams(
      new URLSearchParams("preset=numbers&method=sort"),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    store.getState().loadSharedState(parsed.snapshot);
    const state = store.getState();
    expect(state.variableName).toBe("numbers");
    expect(state.selectedMethod).toBe("sort");
    expect(state.list.map((item) => item.value)).toEqual([
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ]);
    expect(state.history).toEqual([]);
    expect(state.lastResult).toBeNull();
    expect(state.activeChallengeId).toBeNull();
    expect(state.isAnimating).toBe(false);
  });

  it("steps through len and commits the list immediately", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);
    store.getState().setStepMode(true);
    store.getState().setSelectedMethod("len");
    store.getState().executeOperation();

    let state = store.getState();
    expect(state.playbackKind).toBe("step");
    expect(state.steps.length).toBeGreaterThan(1);
    expect(state.stepIndex).toBe(0);
    expect(state.resultRevealed).toBe(false);
    expect(ids(store)).toEqual(originalIds);
    expect(canStepBack(state)).toBe(false);

    store.getState().stepForward();
    expect(store.getState().stepIndex).toBe(1);

    store.getState().stepBack();
    expect(store.getState().stepIndex).toBe(0);

    while (store.getState().playbackKind === "step") {
      store.getState().stepForward();
    }

    state = store.getState();
    expect(state.playbackKind).toBe("idle");
    expect(state.resultRevealed).toBe(true);
    expect(state.steps).toEqual([]);
    expect(state.lastResult?.returnValue).toEqual(pythonNumber(3));
  });

  it("locks mutating step playback and finishes cleanly when Step mode is turned off", () => {
    const store = createPlaygroundStore();
    store.getState().setStepMode(true);
    store.getState().setSelectedMethod("insert");
    store.getState().setIndexText("0");
    store.getState().setValueDraft({
      type: "string",
      text: "kiwi",
      booleanValue: true,
    });
    store.getState().executeOperation();

    expect(store.getState().playbackKind).toBe("step");
    expect(store.getState().list).toHaveLength(4);

    store.getState().executeOperation();
    expect(store.getState().history).toHaveLength(1);

    store.getState().setStepMode(false);
    const state = store.getState();
    expect(state.stepMode).toBe(false);
    expect(state.playbackKind).toBe("idle");
    expect(state.resultRevealed).toBe(true);
    expect(state.list).toHaveLength(4);
  });

  it("allows undo during a mutation animation without replaying the method", () => {
    const store = createPlaygroundStore();
    const originalIds = ids(store);
    store.getState().executeOperation();
    expect(store.getState().playbackKind).toBe("operation");

    store.getState().undo();
    expect(ids(store)).toEqual(originalIds);
    expect(store.getState().playbackKind).toBe("undo");
    expect(store.getState().resultRevealed).toBe(true);
  });
});

describe("parsePersistedState", () => {
  it("returns null for invalid payloads", () => {
    expect(parsePersistedState(null)).toBeNull();
    expect(parsePersistedState({ garbage: true })).toBeNull();
    expect(
      parsePersistedState({
        variableName: "fruits",
        list: [{ id: "x", value: { type: "mystery", value: 1 } }],
        selectedMethod: "append",
        arguments: createDefaultArguments(),
        animationSpeed: 1,
        selectedPreset: "fruits",
      }),
    ).toBeNull();
  });

  it("accepts a versioned payload and a valid snapshot", () => {
    const snapshot = {
      variableName: "numbers",
      list: [
        { id: "a", value: pythonNumber(1) },
        { id: "b", value: pythonNumber(2) },
      ],
      selectedMethod: "sort" as const,
      arguments: createDefaultArguments(),
      animationSpeed: 1.5 as const,
      selectedPreset: "numbers" as const,
    };

    expect(parsePersistedState({ state: snapshot, version: 1 })).toEqual({
      ...snapshot,
      presetSource: "numbers",
      xRayMode: false,
      stepMode: false,
    });
    expect(parsePersistedState(snapshot)).toEqual({
      ...snapshot,
      presetSource: "numbers",
      xRayMode: false,
      stepMode: false,
    });
  });
});
