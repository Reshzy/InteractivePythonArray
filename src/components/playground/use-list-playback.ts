"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

import {
  Flip,
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";
import {
  CELL_STATE_ATTRIBUTE,
  type CellVisualState,
} from "@/lib/animations/highlights";
import { startPlayback } from "@/lib/animations/play";
import { routePlayback, type SecondaryLabels } from "@/lib/animations/playback";
import { prefersReducedMotion, resolveAnimationMode } from "@/lib/animations/reduced-motion";
import {
  shouldFlipLayout,
  type PlaybackRuntime,
  type VisualCommit,
} from "@/lib/animations/runtime";
import { BASE_DURATIONS, scaleDuration } from "@/lib/animations/timing";
import { heldCellStatesFromResult } from "@/lib/playground/held-states";
import { cellVisualStateAt } from "@/lib/playground/steps";
import { cloneList } from "@/lib/python";
import type { ListItem } from "@/lib/python/types";
import { usePlaygroundStore } from "@/store/playground-store";

registerGsapPlugins();

export type PlaybackVisual = {
  sessionId: number;
  displayList: ListItem[] | null;
  incoming: ListItem[];
  secondary: ListItem[] | null;
  secondaryLabels: SecondaryLabels | null;
};

type PendingLayout = {
  timeline: ReturnType<typeof gsap.timeline>;
  flip: ReturnType<typeof Flip.getState> | null;
  expected: PlaybackVisual;
  generation: number;
};

function queryAll(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function createOverlay(sessionId: number): PlaybackVisual {
  return {
    sessionId,
    displayList: null,
    incoming: [],
    secondary: null,
    secondaryLabels: null,
  };
}

export function useListPlayback(rootRef: RefObject<HTMLElement | null>) {
  const list = usePlaygroundStore((state) => state.list);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const resultView = usePlaygroundStore((state) => state.resultView);
  const isAnimating = usePlaygroundStore((state) => state.isAnimating);
  const sessionId = usePlaygroundStore((state) => state.playbackSessionId);
  const playbackFrom = usePlaygroundStore((state) => state.playbackFrom);
  const playbackKind = usePlaygroundStore((state) => state.playbackKind);
  const steps = usePlaygroundStore((state) => state.steps);
  const stepIndex = usePlaygroundStore((state) => state.stepIndex);

  const [overlay, setOverlay] = useState<PlaybackVisual>(() =>
    createOverlay(sessionId),
  );
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [visualizerError, setVisualizerError] = useState(false);

  if (overlay.sessionId !== sessionId) {
    setOverlay(createOverlay(sessionId));
  }

  const generationRef = useRef(0);
  const pendingLayout = useRef<PendingLayout | null>(null);

  const currentStep = playbackKind === "step" ? steps[stepIndex] : undefined;

  const displayList = currentStep
    ? (currentStep.statePreview ?? playbackFrom ?? list)
    : isAnimating
      ? (overlay.displayList ?? playbackFrom ?? list)
      : list;

  useLayoutEffect(() => {
    const pending = pendingLayout.current;
    if (!pending || pending.expected !== overlay) {
      return;
    }

    pendingLayout.current = null;
    const root = rootRef.current;
    const reduced = prefersReducedMotion();
    const speed = usePlaygroundStore.getState().animationSpeed;
    const duration = scaleDuration(
      reduced ? BASE_DURATIONS.reduced : BASE_DURATIONS.flip,
      speed,
    );

    if (!pending.flip || !root || reduced) {
      pending.timeline.resume();
      return;
    }

    try {
      const animation = Flip.from(pending.flip, {
        duration,
        ease: "power3.inOut",
        absolute: true,
        scale: false,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            {
              autoAlpha: 0,
              scale: reduced ? 1 : 0.8,
              y: reduced ? 0 : 16,
            },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: scaleDuration(
                reduced ? BASE_DURATIONS.reduced : BASE_DURATIONS.enter,
                speed,
              ),
              ease: "power2.out",
            },
          );
        },
        onLeave: (elements) => {
          gsap.to(elements, {
            autoAlpha: 0,
            y: reduced ? 0 : -16,
            scale: reduced ? 1 : 0.9,
            duration: scaleDuration(
              reduced ? BASE_DURATIONS.reduced : BASE_DURATIONS.fade,
              speed,
            ),
            ease: "power2.in",
          });
        },
        onComplete: () => {
          pending.timeline.resume();
        },
      });

      if (!animation || animation.totalDuration() === 0) {
        pending.timeline.resume();
      }
    } catch {
      pending.timeline.resume();
    }
  }, [rootRef, overlay]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const state = usePlaygroundStore.getState();
      if (
        !root ||
        state.playbackKind === "idle" ||
        state.playbackKind === "step"
      ) {
        return;
      }

      const generation = ++generationRef.current;
      const fromList = state.playbackFrom ?? state.list;
      const mode = resolveAnimationMode({
        prefersReducedMotion: prefersReducedMotion(),
        listLength: Math.max(fromList.length, state.list.length),
      });

      pendingLayout.current = null;
      setScanCount(null);
      setDisclaimer(null);
      setVisualizerError(false);

      const timeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (generationRef.current === generation) {
            usePlaygroundStore.getState().completePlayback();
          }
        },
      });

      const commitVisual = (patch: VisualCommit) => {
        if (generationRef.current !== generation) {
          return;
        }

        const activeSessionId = usePlaygroundStore.getState().playbackSessionId;
        timeline.pause();
        const shouldFlip = patch.flip === true && shouldFlipLayout(mode);
        const flipTargets = shouldFlip
          ? queryAll(root, "[data-flip-id]")
          : [];

        setOverlay((current) => {
          const next: PlaybackVisual = {
            sessionId: activeSessionId,
            displayList: patch.displayList
              ? cloneList(patch.displayList)
              : current.displayList,
            incoming:
              patch.incoming !== undefined
                ? cloneList(patch.incoming)
                : current.incoming,
            secondary:
              patch.secondary !== undefined
                ? patch.secondary
                  ? cloneList(patch.secondary)
                  : null
                : current.secondary,
            secondaryLabels:
              patch.secondaryLabels !== undefined
                ? patch.secondaryLabels
                : current.secondaryLabels,
          };

          pendingLayout.current = {
            timeline,
            flip:
              shouldFlip && flipTargets.length > 0
                ? Flip.getState(flipTargets)
                : null,
            expected: next,
            generation,
          };
          return next;
        });

        window.setTimeout(() => {
          const pending = pendingLayout.current;
          if (pending?.generation === generation) {
            pendingLayout.current = null;
            pending.timeline.resume();
          }
        }, 80);
      };

      const runtime: PlaybackRuntime = {
        root,
        timeline,
        speed: state.animationSpeed,
        mode,
        before:
          state.playbackKind === "operation" && state.lastResult
            ? cloneList(state.lastResult.before)
            : cloneList(fromList),
        after: cloneList(state.list),
        returnValue: state.lastResult?.returnValue,
        variableName: state.variableName,
        method: state.selectedMethod,
        duration: (baseSeconds) =>
          scaleDuration(baseSeconds, state.animationSpeed),
        getMainCells: () => queryAll(root, "[data-track='list'] [data-list-cell]"),
        getCellById: (id) =>
          root.querySelector<HTMLElement>(`[data-flip-id="${CSS.escape(id)}"]`),
        getIncomingCells: () =>
          queryAll(root, "[data-track='incoming'] [data-list-cell]"),
        getSecondaryCells: () =>
          queryAll(root, "[data-track='secondary'] [data-list-cell]"),
        getVisualizer: () =>
          root.querySelector<HTMLElement>("[data-list-visualizer]"),
        getResultReturns: () =>
          root.querySelector<HTMLElement>("[data-result-returns]"),
        setCellState: (id, cellState) => {
          const cell = root.querySelector<HTMLElement>(
            `[data-flip-id="${CSS.escape(id)}"]`,
          );
          if (cell) {
            cell.setAttribute(CELL_STATE_ATTRIBUTE, cellState);
          }
        },
        clearCellStates: () => {
          for (const cell of queryAll(root, "[data-list-cell]")) {
            cell.setAttribute(CELL_STATE_ATTRIBUTE, "idle" satisfies CellVisualState);
          }
        },
        setVisualizerError: (error) => {
          setVisualizerError(error);
        },
        commitVisual,
        setScanCount,
        setDisclaimer,
        revealResult: () => {
          usePlaygroundStore.getState().revealResult();
        },
      };

      const route = routePlayback({
        playbackKind: state.playbackKind,
        result: state.lastResult,
        method: state.selectedMethod,
      });

      startPlayback(runtime, route);

      if (timeline.getChildren().length === 0) {
        usePlaygroundStore.getState().completePlayback();
        return;
      }

      timeline.play();

      return () => {
        timeline.kill();
        gsap.set(queryAll(root, "[data-list-cell]"), {
          clearProps: "transform,opacity,visibility",
        });
      };
    },
    { scope: rootRef, dependencies: [sessionId] },
  );

  const cellStates = currentStep
    ? displayList.map((_, index) => cellVisualStateAt(currentStep, index))
    : !isAnimating && resultView !== "undone"
      ? heldCellStatesFromResult(lastResult, displayList.length)
      : undefined;

  return {
    displayList,
    incoming: currentStep ? [] : overlay.incoming,
    secondary: currentStep
      ? (currentStep.secondaryPreview ?? null)
      : overlay.secondary,
    secondaryLabels: currentStep
      ? (currentStep.secondaryLabels ?? null)
      : overlay.secondaryLabels,
    scanCount: currentStep ? (currentStep.scanCount ?? null) : scanCount,
    disclaimer: currentStep ? (currentStep.disclaimer ?? null) : disclaimer,
    visualizerError: currentStep
      ? Boolean(currentStep.error)
      : !isAnimating && resultView !== "undone"
        ? Boolean(lastResult?.error)
        : visualizerError,
    interactive: !isAnimating && !currentStep,
    cellStates,
  };
}
