"use client";

import { gsap } from "@/lib/animations/gsap-client";
import { cloneList } from "@/lib/python/values";

import {
  BASE_DURATIONS,
  cappedStagger,
} from "./timing";
import {
  addDelay,
  emphasizeResult,
  isReduced,
  pulseInserted,
  type PlaybackRuntime,
} from "./runtime";
import type { PlaybackRoute } from "./playback";

export function playAppend(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "append" }>,
): void {
  const added = runtime.after[route.addedIndex];

  if (added && !isReduced(runtime.mode)) {
    runtime.timeline.add(() => {
      runtime.commitVisual({
        displayList: runtime.before,
        incoming: [added],
      });
    });
    runtime.timeline.add(() => {
      const incoming = runtime.getIncomingCells();
      if (incoming.length === 0) {
        return;
      }

      gsap.fromTo(
        incoming,
        { x: 80, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: runtime.duration(0.42),
          ease: "power3.out",
        },
      );
    });
    addDelay(runtime.timeline, runtime.duration(0.44));
    runtime.timeline.add(() => {
      runtime.commitVisual({
        displayList: runtime.after,
        incoming: [],
        flip: true,
      });
    });
  } else {
    runtime.timeline.add(() => {
      runtime.commitVisual({ displayList: runtime.after, flip: true });
    });
  }

  if (added) {
    pulseInserted(runtime, added.id);
  }

  runtime.timeline.add(() => runtime.revealResult());
}

export function playInsert(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "insert" }>,
): void {
  const highlightTarget =
    runtime.before[route.insertedIndex] ??
    runtime.before[runtime.before.length - 1];

  runtime.timeline.add(() => {
    if (highlightTarget) {
      runtime.setCellState(highlightTarget.id, "active-index");
    }
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.06 : 0.18));

  runtime.timeline.add(() => {
    runtime.clearCellStates();
    runtime.commitVisual({ displayList: runtime.after, flip: true });
  });

  const inserted = runtime.after[route.insertedIndex];
  if (inserted) {
    pulseInserted(runtime, inserted.id);
  }

  runtime.timeline.add(() => runtime.revealResult());
}

export function playPop(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "pop" }>,
): void {
  const removed = runtime.before[route.removedIndex];
  if (!removed) {
    runtime.timeline.add(() => {
      runtime.commitVisual({ displayList: runtime.after, flip: true });
      runtime.revealResult();
    });
    return;
  }

  runtime.timeline.add(() => {
    runtime.setCellState(removed.id, "active-index");
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.06 : 0.16));

  runtime.timeline.add(() => {
    runtime.setCellState(removed.id, "returned");
  });
  runtime.timeline.add(() => {
    const cell = runtime.getCellById(removed.id);
    if (cell && !isReduced(runtime.mode)) {
      gsap.to(cell, {
        y: 28,
        autoAlpha: 0,
        duration: runtime.duration(0.28),
        ease: "power2.in",
      });
    }
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.06 : 0.3));
  runtime.timeline.add(() => {
    runtime.commitVisual({ displayList: runtime.after, flip: true });
  });
  runtime.timeline.add(() => runtime.revealResult());
  emphasizeResult(runtime);
}

export function playClear(runtime: PlaybackRuntime): void {
  const cells = runtime.getMainCells();
  if (cells.length === 0) {
    runtime.timeline.add(() => {
      runtime.commitVisual({ displayList: [] });
      runtime.revealResult();
    });
    return;
  }

  const stagger = cappedStagger({
    each: runtime.duration(BASE_DURATIONS.staggerEach),
    count: cells.length,
    maxTotal: runtime.duration(MAX_STAGGER_FOR_CLEAR),
  });

  runtime.timeline.to(cells, {
    y: isReduced(runtime.mode) ? 0 : -12,
    autoAlpha: 0,
    duration: runtime.duration(isReduced(runtime.mode) ? BASE_DURATIONS.reduced : BASE_DURATIONS.fade),
    stagger: runtime.mode === "simplified" ? 0 : stagger,
    ease: "power2.in",
  });

  runtime.timeline.add(() => {
    runtime.commitVisual({ displayList: [] });
    runtime.revealResult();
  });
}

const MAX_STAGGER_FOR_CLEAR = 0.55;

export function playExtend(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "extend" }>,
): void {
  const added = route.addedIndices
    .map((index) => runtime.after[index])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (added.length === 0) {
    runtime.timeline.add(() => runtime.revealResult());
    return;
  }

  runtime.timeline.add(() => {
    runtime.commitVisual({
      displayList: runtime.before,
      incoming: added,
    });
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.08 : 0.2));

  if (runtime.mode === "simplified" || added.length > 8) {
    runtime.timeline.add(() => {
      runtime.commitVisual({
        displayList: runtime.after,
        incoming: [],
        flip: true,
      });
    });
  } else {
    let visual = cloneList(runtime.before);
    let remaining = [...added];

    for (const item of added) {
      runtime.timeline.add(() => {
        visual = [...visual, item];
        remaining = remaining.filter((candidate) => candidate.id !== item.id);
        runtime.commitVisual({
          displayList: visual,
          incoming: remaining,
          flip: true,
        });
      });
    }
  }

  runtime.timeline.add(() => {
    for (const item of added) {
      runtime.setCellState(item.id, "inserted");
    }
  });
  addDelay(runtime.timeline, runtime.duration(BASE_DURATIONS.pulse));
  runtime.timeline.add(() => runtime.clearCellStates());
  runtime.timeline.add(() => runtime.revealResult());
}

export function playCopy(runtime: PlaybackRuntime): void {
  const copied = Array.isArray(runtime.returnValue)
    ? runtime.returnValue
    : [];

  runtime.timeline.add(() => {
    for (const item of runtime.before) {
      runtime.setCellState(item.id, "moved");
    }
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.06 : 0.18));

  runtime.timeline.add(() => {
    runtime.commitVisual({
      secondary: copied,
      secondaryLabels: {
        source: runtime.variableName,
        destination: "copied",
      },
    });
  });

  runtime.timeline.add(() => {
    const cells = runtime.getSecondaryCells();
    if (cells.length === 0) {
      return;
    }

    gsap.fromTo(
      cells,
      {
        autoAlpha: 0,
        y: isReduced(runtime.mode) ? 0 : 10,
        scale: isReduced(runtime.mode) ? 1 : 0.92,
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: runtime.duration(BASE_DURATIONS.enter),
        stagger: cappedStagger({
          each: runtime.duration(0.05),
          count: cells.length,
          maxTotal: runtime.duration(0.4),
        }),
        ease: "power2.out",
      },
    );
  });
  addDelay(runtime.timeline, runtime.duration(BASE_DURATIONS.enter));
  runtime.timeline.add(() => runtime.clearCellStates());
  runtime.timeline.add(() => runtime.revealResult());
}
