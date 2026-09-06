import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createStore, type StoreApi } from "zustand/vanilla";

import {
  type Challenge,
  type ChallengeId,
} from "@/data/challenges";
import {
  DEFAULT_ANIMATION_SPEED,
  isAnimationSpeed,
  type AnimationSpeed,
} from "@/data/playground-demo";
import { getMethod, isMethodId, type MethodTryIt } from "@/data/methods";
import {
  createPresetList,
  DEFAULT_PRESET_ID,
  getPreset,
  isPresetId,
  type PresetId,
} from "@/data/presets";
import {
  argumentsForMethod,
  argumentsFromTryIt,
  buildOperationRequest,
  cloneArguments,
  createDefaultArguments,
  isPythonValueType,
  type OperationArguments,
  type ValueDraft,
} from "@/lib/playground/arguments";
import { isRunLocked, type PlaybackKind } from "@/lib/animations/playback";

export { isRunLocked };
import { prefersReducedMotion } from "@/lib/animations/reduced-motion";
import {
  cloneList,
  clonePythonValue,
  createList,
  createListItem,
  createListItemId,
  executeOperation,
} from "@/lib/python";
import type {
  ListItem,
  MethodId,
  OperationResult,
  PlaygroundError,
  PythonValue,
} from "@/lib/python/types";

export const PLAYGROUND_STORAGE_KEY = "python-lists-playground";
export const PLAYGROUND_PERSIST_VERSION = 1;

export type HistoryEntry = {
  id: string;
  code: string;
  method: MethodId;
  before: ListItem[];
  after: ListItem[];
  result: OperationResult;
  timestamp: number;
};

export type PlaygroundState = {
  variableName: string;
  list: ListItem[];
  selectedMethod: MethodId;
  arguments: OperationArguments;
  lastResult: OperationResult | null;
  history: HistoryEntry[];
  historyIndex: number;
  animationSpeed: AnimationSpeed;
  selectedPreset: PresetId | null;
  hasHydrated: boolean;
  isAnimating: boolean;
  playbackKind: PlaybackKind;
  resultRevealed: boolean;
  playbackSessionId: number;
  playbackFrom: ListItem[] | null;
  activeChallengeId: ChallengeId | null;
};

export type PersistedPlaygroundState = {
  variableName: string;
  list: ListItem[];
  selectedMethod: MethodId;
  arguments: OperationArguments;
  animationSpeed: AnimationSpeed;
  selectedPreset: PresetId | null;
};

export type PlaygroundActions = {
  setHasHydrated: (hasHydrated: boolean) => void;
  setVariableName: (variableName: string) => void;
  setSelectedMethod: (method: MethodId) => void;
  setValueDraft: (draft: ValueDraft) => void;
  setValuesDraft: (values: ValueDraft[]) => void;
  updateValueDraftAt: (index: number, draft: ValueDraft) => void;
  addExtendValue: () => void;
  removeExtendValue: (index: number) => void;
  setIndexText: (indexText: string) => void;
  setReverse: (reverse: boolean) => void;
  addListItem: (value: PythonValue) => void;
  updateListItem: (id: string, value: PythonValue) => void;
  removeListItem: (id: string) => void;
  executeOperation: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  loadPreset: (id: PresetId) => void;
  tryMethod: (method: MethodId, snapshot?: MethodTryIt) => void;
  loadChallenge: (challenge: Challenge) => void;
  setAnimationSpeed: (animationSpeed: AnimationSpeed) => void;
  completePlayback: () => void;
  revealResult: () => void;
  cancelPlayback: () => void;
};

export type PlaygroundStore = PlaygroundState & PlaygroundActions;

type SetPlaygroundState = StoreApi<PlaygroundStore>["setState"];
type GetPlaygroundState = StoreApi<PlaygroundStore>["getState"];

export function createDefaultPlaygroundState(): PlaygroundState {
  const preset = getPreset(DEFAULT_PRESET_ID);

  return {
    variableName: preset.variableName,
    list: createPresetList(DEFAULT_PRESET_ID),
    selectedMethod: "append",
    arguments: createDefaultArguments(),
    lastResult: null,
    history: [],
    historyIndex: -1,
    animationSpeed: DEFAULT_ANIMATION_SPEED,
    selectedPreset: DEFAULT_PRESET_ID,
    hasHydrated: false,
    isAnimating: false,
    playbackKind: "idle",
    resultRevealed: true,
    playbackSessionId: 0,
    playbackFrom: null,
    activeChallengeId: null,
  };
}

function challengeMethod(challenge: Challenge): MethodId {
  return (
    challenge.expectedMethod ??
    challenge.allowedMethods?.[0] ??
    "append"
  );
}

function startPlaybackSession(
  state: PlaygroundState,
  kind: PlaybackKind,
  resultRevealed: boolean,
  playbackFrom: ListItem[],
): Pick<
  PlaygroundState,
  | "isAnimating"
  | "playbackKind"
  | "resultRevealed"
  | "playbackSessionId"
  | "playbackFrom"
> {
  return {
    isAnimating: true,
    playbackKind: kind,
    resultRevealed,
    playbackSessionId: state.playbackSessionId + 1,
    playbackFrom: cloneList(playbackFrom),
  };
}

export function canUndo(state: Pick<PlaygroundState, "historyIndex">): boolean {
  return state.historyIndex >= 0;
}

export function canRedo(
  state: Pick<PlaygroundState, "history" | "historyIndex">,
): boolean {
  return state.historyIndex < state.history.length - 1;
}

function clientFailureResult(
  list: readonly ListItem[],
  error: PlaygroundError,
  code: string,
): OperationResult {
  const before = cloneList(list);

  return {
    before,
    after: cloneList(list),
    mutates: false,
    error,
    code,
    explanation: error.friendlyMessage,
    animation: { type: "none" },
  };
}

function createHistoryEntry(
  method: MethodId,
  result: OperationResult,
): HistoryEntry {
  return {
    id: createListItemId(),
    code: result.code,
    method,
    before: cloneList(result.before),
    after: cloneList(result.after),
    result,
    timestamp: Date.now(),
  };
}

function pushHistory(
  state: PlaygroundState,
  entry: HistoryEntry,
): Pick<PlaygroundState, "history" | "historyIndex"> {
  const truncated = state.history.slice(0, state.historyIndex + 1);
  return {
    history: [...truncated, entry],
    historyIndex: truncated.length,
  };
}

export function createPlaygroundApi(
  set: SetPlaygroundState,
  get: GetPlaygroundState,
): PlaygroundStore {
  return {
    ...createDefaultPlaygroundState(),

    setHasHydrated: (hasHydrated) => set({ hasHydrated }),

    setVariableName: (variableName) => set({ variableName }),

    setSelectedMethod: (method) => {
      const state = get();
      set({
        selectedMethod: method,
        arguments: argumentsForMethod(method, state.arguments),
        lastResult: null,
      });
    },

    setValueDraft: (draft) => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          value: draft,
        },
      });
    },

    setValuesDraft: (values) => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          values,
        },
      });
    },

    updateValueDraftAt: (index, draft) => {
      const state = get();
      const values = state.arguments.values.map((item, itemIndex) =>
        itemIndex === index ? draft : item,
      );
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          values,
        },
      });
    },

    addExtendValue: () => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          values: [
            ...state.arguments.values,
            {
              type: "string",
              text: "",
              booleanValue: true,
            },
          ],
        },
      });
    },

    removeExtendValue: (index) => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          values: state.arguments.values.filter(
            (_item, itemIndex) => itemIndex !== index,
          ),
        },
      });
    },

    setIndexText: (indexText) => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          indexText,
        },
      });
    },

    setReverse: (reverse) => {
      const state = get();
      set({
        arguments: {
          ...cloneArguments(state.arguments),
          reverse,
        },
      });
    },

    addListItem: (value) => {
      set((state) => ({
        list: [...state.list, createListItem(value)],
        selectedPreset: null,
        lastResult: null,
      }));
    },

    updateListItem: (id, value) => {
      set((state) => ({
        list: state.list.map((item) =>
          item.id === id
            ? { id: item.id, value: clonePythonValue(value) }
            : item,
        ),
        selectedPreset: null,
        lastResult: null,
      }));
    },

    removeListItem: (id) => {
      set((state) => ({
        list: state.list.filter((item) => item.id !== id),
        selectedPreset: null,
        lastResult: null,
      }));
    },

    executeOperation: () => {
      const state = get();
      if (isRunLocked(state)) {
        return;
      }

      const built = buildOperationRequest({
        list: state.list,
        variableName: state.variableName,
        method: state.selectedMethod,
        arguments: state.arguments,
      });

      const result = built.ok
        ? executeOperation(built.request)
        : clientFailureResult(state.list, built.error, built.code);

      const entry = createHistoryEntry(state.selectedMethod, result);

      set({
        list: cloneList(result.after),
        lastResult: result,
        selectedPreset: result.mutates ? null : state.selectedPreset,
        ...pushHistory(state, entry),
        ...startPlaybackSession(
          state,
          "operation",
          prefersReducedMotion(),
          result.before,
        ),
      });
    },

    undo: () => {
      const state = get();
      if (!canUndo(state)) {
        return;
      }

      const entry = state.history[state.historyIndex];
      if (!entry) {
        return;
      }

      const previous = state.history[state.historyIndex - 1];

      set({
        list: cloneList(entry.before),
        lastResult: previous?.result ?? null,
        historyIndex: state.historyIndex - 1,
        selectedPreset: null,
        ...startPlaybackSession(state, "undo", true, state.list),
      });
    },

    redo: () => {
      const state = get();
      if (!canRedo(state)) {
        return;
      }

      const nextIndex = state.historyIndex + 1;
      const entry = state.history[nextIndex];
      if (!entry) {
        return;
      }

      set({
        list: cloneList(entry.after),
        lastResult: entry.result,
        historyIndex: nextIndex,
        selectedPreset: null,
        ...startPlaybackSession(state, "redo", true, state.list),
      });
    },

    reset: () => {
      const current = get();
      set({
        ...createDefaultPlaygroundState(),
        animationSpeed: current.animationSpeed,
        hasHydrated: current.hasHydrated,
        isAnimating: true,
        playbackKind: "reset",
        resultRevealed: true,
        playbackSessionId: current.playbackSessionId + 1,
        playbackFrom: cloneList(current.list),
      });
    },

    loadPreset: (id) => {
      const preset = getPreset(id);
      const state = get();

      set({
        variableName: preset.variableName,
        list: createPresetList(id),
        selectedPreset: id,
        lastResult: null,
        history: [],
        historyIndex: -1,
        arguments: argumentsForMethod(state.selectedMethod, state.arguments),
        activeChallengeId: null,
        ...startPlaybackSession(state, "preset", true, state.list),
      });
    },

    tryMethod: (method, snapshot) => {
      const state = get();
      const tryIt = snapshot ?? getMethod(method).tryIt;

      set({
        selectedMethod: method,
        variableName: tryIt.variableName,
        list: createList(tryIt.list),
        arguments: argumentsFromTryIt(method, tryIt),
        lastResult: null,
        selectedPreset: null,
        activeChallengeId: null,
        isAnimating: false,
        playbackKind: "idle",
        resultRevealed: true,
        playbackFrom: null,
        playbackSessionId: state.playbackSessionId + 1,
      });
    },

    loadChallenge: (challenge) => {
      const state = get();
      const method = challengeMethod(challenge);

      set({
        selectedMethod: method,
        variableName: challenge.variableName,
        list: createList(challenge.initialList),
        arguments: argumentsFromTryIt(method, challenge.setup),
        lastResult: null,
        selectedPreset: null,
        history: [],
        historyIndex: -1,
        activeChallengeId: challenge.id,
        isAnimating: false,
        playbackKind: "idle",
        resultRevealed: true,
        playbackFrom: null,
        playbackSessionId: state.playbackSessionId + 1,
      });
    },

    setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),

    completePlayback: () =>
      set({
        isAnimating: false,
        playbackKind: "idle",
        resultRevealed: true,
        playbackFrom: null,
      }),

    revealResult: () => set({ resultRevealed: true }),

    cancelPlayback: () => {
      const state = get();
      if (!state.isAnimating) {
        return;
      }

      set({
        isAnimating: false,
        playbackKind: "idle",
        resultRevealed: true,
        playbackFrom: null,
        playbackSessionId: state.playbackSessionId + 1,
      });
    },
  };
}

export function createPlaygroundStore(): StoreApi<PlaygroundStore> {
  return createStore<PlaygroundStore>()((set, get) => createPlaygroundApi(set, get));
}

function isListItem(value: unknown): value is ListItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as { id?: unknown; value?: unknown };
  return typeof item.id === "string" && item.id.length > 0 && isPythonValue(item.value);
}

function isPythonValue(value: unknown): value is PythonValue {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { type?: unknown; value?: unknown };

  if (candidate.type === "string") {
    return typeof candidate.value === "string";
  }

  if (candidate.type === "number") {
    return typeof candidate.value === "number" && Number.isFinite(candidate.value);
  }

  if (candidate.type === "boolean") {
    return typeof candidate.value === "boolean";
  }

  if (candidate.type === "none") {
    return candidate.value === null;
  }

  return false;
}

function isValueDraft(value: unknown): value is ValueDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as {
    type?: unknown;
    text?: unknown;
    booleanValue?: unknown;
  };

  return (
    isPythonValueType(draft.type) &&
    typeof draft.text === "string" &&
    typeof draft.booleanValue === "boolean"
  );
}

function isOperationArguments(value: unknown): value is OperationArguments {
  if (!value || typeof value !== "object") {
    return false;
  }

  const args = value as {
    value?: unknown;
    values?: unknown;
    indexText?: unknown;
    reverse?: unknown;
  };

  return (
    isValueDraft(args.value) &&
    Array.isArray(args.values) &&
    args.values.every(isValueDraft) &&
    typeof args.indexText === "string" &&
    typeof args.reverse === "boolean"
  );
}

function unwrapPersistedState(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if ("state" in value) {
    return (value as { state: unknown }).state;
  }

  return value;
}

export function parsePersistedState(
  value: unknown,
): PersistedPlaygroundState | null {
  const unwrapped = unwrapPersistedState(value);
  if (!unwrapped || typeof unwrapped !== "object") {
    return null;
  }

  const candidate = unwrapped as {
    variableName?: unknown;
    list?: unknown;
    selectedMethod?: unknown;
    arguments?: unknown;
    animationSpeed?: unknown;
    selectedPreset?: unknown;
  };

  if (typeof candidate.variableName !== "string") {
    return null;
  }

  if (!Array.isArray(candidate.list) || !candidate.list.every(isListItem)) {
    return null;
  }

  if (!isMethodId(candidate.selectedMethod)) {
    return null;
  }

  if (!isOperationArguments(candidate.arguments)) {
    return null;
  }

  if (!isAnimationSpeed(candidate.animationSpeed)) {
    return null;
  }

  if (
    candidate.selectedPreset !== null &&
    !isPresetId(candidate.selectedPreset)
  ) {
    return null;
  }

  return {
    variableName: candidate.variableName,
    list: candidate.list.map((item) => ({
      id: item.id,
      value: clonePythonValue(item.value),
    })),
    selectedMethod: candidate.selectedMethod,
    arguments: cloneArguments(candidate.arguments),
    animationSpeed: candidate.animationSpeed,
    selectedPreset: candidate.selectedPreset,
  };
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => createPlaygroundApi(set, get),
    {
      name: PLAYGROUND_STORAGE_KEY,
      version: PLAYGROUND_PERSIST_VERSION,
      skipHydration: true,
      partialize: (state): PersistedPlaygroundState => ({
        variableName: state.variableName,
        list: state.list,
        selectedMethod: state.selectedMethod,
        arguments: state.arguments,
        animationSpeed: state.animationSpeed,
        selectedPreset: state.selectedPreset,
      }),
      merge: (persistedState, currentState) => {
        const persisted = parsePersistedState(
          unwrapPersistedState(persistedState),
        );
        if (!persisted) {
          return currentState;
        }

        return {
          ...currentState,
          ...persisted,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
