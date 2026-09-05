import { describe, expect, it } from "vitest";

import { createDefaultArguments } from "@/lib/playground/arguments";
import { pythonNumber, pythonString } from "@/lib/python/values";
import {
  canRedo,
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
    expect(store.getState().lastResult).toBeNull();
    expect(canUndo(store.getState())).toBe(false);
    expect(canRedo(store.getState())).toBe(true);

    store.getState().redo();
    expect(ids(store)).toEqual(afterAppendIds);
    expect(store.getState().list[3]?.value).toEqual(pythonString("mango"));
    expect(store.getState().lastResult?.code).toBe('fruits.append("mango")');
  });

  it("truncates the redo branch after a new operation", () => {
    const store = createPlaygroundStore();

    store.getState().executeOperation();
    store.getState().setValueDraft({
      type: "string",
      text: "kiwi",
      booleanValue: true,
    });
    store.getState().executeOperation();
    expect(store.getState().history).toHaveLength(2);

    store.getState().undo();
    expect(canRedo(store.getState())).toBe(true);

    store.getState().setValueDraft({
      type: "string",
      text: "pear",
      booleanValue: true,
    });
    store.getState().executeOperation();

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

    expect(parsePersistedState({ state: snapshot, version: 1 })).toEqual(
      snapshot,
    );
    expect(parsePersistedState(snapshot)).toEqual(snapshot);
  });
});
