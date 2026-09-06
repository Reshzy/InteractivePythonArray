"use client";

import { useEffect, useRef } from "react";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  LightbulbIcon,
  RotateCcwIcon,
} from "lucide-react";

import { MiniList, type MiniListCell } from "@/components/learn/MiniList";
import { focusPlayground } from "@/components/learn/TryItButton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CHALLENGES,
  getAdjacentChallengeId,
  getChallenge,
  getChallengeIndex,
  type Challenge,
} from "@/data/challenges";
import {
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";
import { prefersReducedMotion } from "@/lib/animations/reduced-motion";
import type { ChallengeVerdict } from "@/lib/challenges/evaluate";
import { formatPythonList, formatPythonValue } from "@/lib/python/format";
import type { PythonValue } from "@/lib/python/types";
import { useChallengesStore } from "@/store/challenges-store";
import { usePlaygroundStore } from "@/store/playground-store";

import { useChallengeGrading } from "./use-challenge-grading";

registerGsapPlugins();

function cellsFromValues(values: readonly PythonValue[]): MiniListCell[] {
  return values.map((value) => ({ text: formatPythonValue(value) }));
}

function formatExpectedReturn(challenge: Challenge): string | null {
  if (challenge.expectedReturnValue === undefined) {
    return null;
  }

  if (challenge.expectedReturnValue === "list-copy") {
    return "a new list with the same items";
  }

  return formatPythonValue(challenge.expectedReturnValue);
}

function ListSnapshot({
  label,
  values,
}: {
  label: string;
  values: readonly PythonValue[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-xs">{formatPythonList(values)}</p>
      {values.length > 0 ? (
        <MiniList
          cells={cellsFromValues(values)}
          label={`${label} ${formatPythonList(values)}`}
        />
      ) : null}
    </div>
  );
}

export function ChallengesSection() {
  const currentChallengeId = useChallengesStore(
    (state) => state.currentChallengeId,
  );
  const completedIds = useChallengesStore((state) => state.completedIds);
  const hintVisible = useChallengesStore((state) => state.hintVisible);
  const lastVerdict = useChallengesStore((state) => state.lastVerdict);
  const hasHydrated = useChallengesStore((state) => state.hasHydrated);
  const selectChallenge = useChallengesStore((state) => state.selectChallenge);
  const revealHint = useChallengesStore((state) => state.revealHint);
  const clearAttempt = useChallengesStore((state) => state.clearAttempt);
  const loadChallenge = usePlaygroundStore((state) => state.loadChallenge);
  const activeChallengeId = usePlaygroundStore(
    (state) => state.activeChallengeId,
  );

  useChallengeGrading();

  useEffect(() => {
    void Promise.resolve(useChallengesStore.persist.rehydrate()).finally(() => {
      useChallengesStore.getState().setHasHydrated(true);
    });
  }, []);

  const challenge = getChallenge(currentChallengeId);
  const index = getChallengeIndex(currentChallengeId);
  const completed = completedIds.includes(currentChallengeId);
  const loadedHere = activeChallengeId === currentChallengeId;
  const expectedReturn = formatExpectedReturn(challenge);
  const announcement =
    lastVerdict.status === "idle"
      ? loadedHere
        ? `${challenge.title} is loaded in the playground.`
        : `${challenge.title} is ready. Open it in the playground to try.`
      : `${lastVerdict.title} ${lastVerdict.message}`;

  function openChallenge(id = currentChallengeId) {
    const next = getChallenge(id);
    selectChallenge(id);
    clearAttempt();
    loadChallenge(next);
    focusPlayground();
  }

  function goAdjacent(direction: -1 | 1) {
    openChallenge(getAdjacentChallengeId(currentChallengeId, direction));
  }

  function resetChallenge() {
    clearAttempt();
    loadChallenge(challenge);
    focusPlayground();
  }

  return (
    <section
      id="challenges"
      aria-labelledby="challenges-heading"
      className="scroll-mt-22 mx-auto w-full max-w-6xl px-4 py-12 pb-16"
    >
      <div className="mb-6 flex max-w-2xl flex-col gap-2">
        <h2 id="challenges-heading" className="text-[1.65rem] font-medium tracking-tight">
          Challenges
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Short list puzzles that use the playground you already have. No
          accounts, points, or streaks — just one concept at a time.
        </p>
        <p className="text-sm text-muted-foreground">
          {hasHydrated
            ? `${completedIds.length} / ${CHALLENGES.length} completed`
            : `${CHALLENGES.length} short exercises`}
        </p>
      </div>

      <article className="flex flex-col gap-5 rounded-xl border border-border bg-card px-4 py-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium tracking-tight">
              {challenge.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Challenge {index + 1} of {CHALLENGES.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {completed ? <Badge>Completed</Badge> : null}
            {loadedHere ? <Badge variant="outline">In playground</Badge> : null}
          </div>
        </div>

        <p className="text-sm leading-relaxed">{challenge.prompt}</p>
        <p className="text-xs text-muted-foreground">
          Concept: <span className="font-mono">{challenge.concept}</span>
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <ListSnapshot label="Start" values={challenge.initialList} />
          <div className="flex flex-col gap-3">
            {challenge.targetList ? (
              <ListSnapshot label="Goal" values={challenge.targetList} />
            ) : null}
            {expectedReturn ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Expected return</p>
                <p className="font-mono text-xs">{expectedReturn}</p>
              </div>
            ) : null}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        {lastVerdict.status === "correct" ||
        lastVerdict.status === "incorrect" ? (
          <ChallengeFeedback verdict={lastVerdict} />
        ) : null}

        {hintVisible && challenge.hint ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {challenge.hint}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="min-h-11"
            onClick={() => openChallenge()}
            aria-label={`Open ${challenge.title} in the playground`}
          >
            Open in Playground
          </Button>
          {challenge.hint ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={revealHint}
              disabled={hintVisible}
            >
              <LightbulbIcon data-icon="inline-start" />
              Show hint
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={resetChallenge}
            aria-label="Reset challenge"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reset challenge
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => goAdjacent(-1)}
            aria-label="Previous challenge"
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => goAdjacent(1)}
            aria-label="Next challenge"
          >
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </article>
    </section>
  );
}

function ChallengeFeedback({
  verdict,
}: {
  verdict: ChallengeVerdict;
}) {
  const checkRef = useRef<SVGSVGElement>(null);
  const correct = verdict.status === "correct";

  useGSAP(
    () => {
      if (verdict.status !== "correct" || !checkRef.current) {
        return;
      }

      if (prefersReducedMotion()) {
        return;
      }

      gsap.fromTo(
        checkRef.current,
        { scale: 0.7, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.35,
          ease: "back.out(1.7)",
        },
      );

      return () => {
        if (checkRef.current) {
          gsap.killTweensOf(checkRef.current);
        }
      };
    },
    { dependencies: [verdict.status, verdict.message] },
  );

  return (
    <Alert>
      {correct ? (
        <CheckCircle2Icon ref={checkRef} aria-hidden="true" />
      ) : (
        <CircleAlertIcon aria-hidden="true" />
      )}
      <AlertTitle>{correct ? "Correct" : "Not quite yet."}</AlertTitle>
      <AlertDescription>{verdict.message}</AlertDescription>
    </Alert>
  );
}
