import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createStore, type StoreApi } from "zustand/vanilla";

import {
  CHALLENGE_IDS,
  DEFAULT_CHALLENGE_ID,
  getAdjacentChallengeId,
  getChallenge,
  isChallengeId,
  type ChallengeId,
} from "@/data/challenges";
import {
  evaluateChallenge,
  IDLE_VERDICT,
  type ChallengeAttempt,
  type ChallengeVerdict,
} from "@/lib/challenges/evaluate";

export const CHALLENGES_STORAGE_KEY = "python-lists-challenges";
export const CHALLENGES_PERSIST_VERSION = 1;

export type ChallengesState = {
  currentChallengeId: ChallengeId;
  completedIds: ChallengeId[];
  hintVisible: boolean;
  lastVerdict: ChallengeVerdict;
  hasHydrated: boolean;
};

export type PersistedChallengesState = {
  currentChallengeId: ChallengeId;
  completedIds: ChallengeId[];
};

export type ChallengesActions = {
  setHasHydrated: (hasHydrated: boolean) => void;
  selectChallenge: (id: ChallengeId) => void;
  goNext: () => void;
  goPrevious: () => void;
  revealHint: () => void;
  clearAttempt: () => void;
  recordAttempt: (
    challengeId: ChallengeId,
    attempt: ChallengeAttempt,
  ) => ChallengeVerdict;
};

export type ChallengesStore = ChallengesState & ChallengesActions;

type SetChallengesState = StoreApi<ChallengesStore>["setState"];
type GetChallengesState = StoreApi<ChallengesStore>["getState"];

function uniqueCompleted(ids: readonly string[]): ChallengeId[] {
  return CHALLENGE_IDS.filter((id) => ids.includes(id));
}

export function createDefaultChallengesState(): ChallengesState {
  return {
    currentChallengeId: DEFAULT_CHALLENGE_ID,
    completedIds: [],
    hintVisible: false,
    lastVerdict: IDLE_VERDICT,
    hasHydrated: false,
  };
}

export function createChallengesApi(
  set: SetChallengesState,
  get: GetChallengesState,
): ChallengesStore {
  return {
    ...createDefaultChallengesState(),

    setHasHydrated: (hasHydrated) => set({ hasHydrated }),

    selectChallenge: (id) => {
      set({
        currentChallengeId: id,
        hintVisible: false,
        lastVerdict: IDLE_VERDICT,
      });
    },

    goNext: () => {
      const current = get().currentChallengeId;
      set({
        currentChallengeId: getAdjacentChallengeId(current, 1),
        hintVisible: false,
        lastVerdict: IDLE_VERDICT,
      });
    },

    goPrevious: () => {
      const current = get().currentChallengeId;
      set({
        currentChallengeId: getAdjacentChallengeId(current, -1),
        hintVisible: false,
        lastVerdict: IDLE_VERDICT,
      });
    },

    revealHint: () => set({ hintVisible: true }),

    clearAttempt: () =>
      set({
        hintVisible: false,
        lastVerdict: IDLE_VERDICT,
      }),

    recordAttempt: (challengeId, attempt) => {
      const challenge = getChallenge(challengeId);
      const verdict = evaluateChallenge(challenge, attempt);
      const completedIds =
        verdict.status === "correct"
          ? uniqueCompleted([...get().completedIds, challengeId])
          : get().completedIds;

      set({
        lastVerdict: verdict,
        completedIds,
      });

      return verdict;
    },
  };
}

export function createChallengesStore(): StoreApi<ChallengesStore> {
  return createStore<ChallengesStore>()((set, get) =>
    createChallengesApi(set, get),
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

export function parsePersistedChallengesState(
  value: unknown,
): PersistedChallengesState | null {
  const unwrapped = unwrapPersistedState(value);
  if (!unwrapped || typeof unwrapped !== "object") {
    return null;
  }

  const candidate = unwrapped as {
    currentChallengeId?: unknown;
    completedIds?: unknown;
  };

  const currentChallengeId = isChallengeId(candidate.currentChallengeId)
    ? candidate.currentChallengeId
    : DEFAULT_CHALLENGE_ID;

  if (!Array.isArray(candidate.completedIds)) {
    return {
      currentChallengeId,
      completedIds: [],
    };
  }

  return {
    currentChallengeId,
    completedIds: uniqueCompleted(
      candidate.completedIds.filter((id): id is string => typeof id === "string"),
    ),
  };
}

export const useChallengesStore = create<ChallengesStore>()(
  persist(
    (set, get) => createChallengesApi(set, get),
    {
      name: CHALLENGES_STORAGE_KEY,
      version: CHALLENGES_PERSIST_VERSION,
      skipHydration: true,
      partialize: (state): PersistedChallengesState => ({
        currentChallengeId: state.currentChallengeId,
        completedIds: state.completedIds,
      }),
      merge: (persistedState, currentState) => {
        const persisted = parsePersistedChallengesState(
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
