"use client";

import { useEffect, useRef } from "react";

import { useChallengesStore } from "@/store/challenges-store";
import { usePlaygroundStore } from "@/store/playground-store";

export function useChallengeGrading() {
  const gradedEntryIds = useRef(new Set<string>());
  const activeChallengeId = usePlaygroundStore(
    (state) => state.activeChallengeId,
  );
  const history = usePlaygroundStore((state) => state.history);
  const historyIndex = usePlaygroundStore((state) => state.historyIndex);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const resultRevealed = usePlaygroundStore((state) => state.resultRevealed);
  const recordAttempt = useChallengesStore((state) => state.recordAttempt);

  useEffect(() => {
    if (!activeChallengeId || history.length === 0) {
      gradedEntryIds.current.clear();
      return;
    }

    if (!lastResult || !resultRevealed || historyIndex < 0) {
      return;
    }

    const entry = history[historyIndex];
    if (!entry || gradedEntryIds.current.has(entry.id)) {
      return;
    }

    gradedEntryIds.current.add(entry.id);
    recordAttempt(activeChallengeId, {
      method: entry.method,
      after: entry.after,
      result: entry.result,
    });
  }, [
    activeChallengeId,
    history,
    historyIndex,
    lastResult,
    recordAttempt,
    resultRevealed,
  ]);
}
