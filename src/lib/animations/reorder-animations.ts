"use client";

import { gsap } from "@/lib/animations/gsap-client";

import { SORT_DISCLAIMER, type PlaybackRoute } from "./playback";
import { BASE_DURATIONS } from "./timing";
import {
  addDelay,
  isReduced,
  type PlaybackRuntime,
} from "./runtime";

export function playError(runtime: PlaybackRuntime): void {
  runtime.timeline.add(() => {
    runtime.setVisualizerError(true);
    runtime.revealResult();
    const visualizer = runtime.getVisualizer();
    if (!visualizer) {
      return;
    }

    gsap.fromTo(
      visualizer,
      { x: 0 },
      {
        x: isReduced(runtime.mode) ? 4 : 10,
        duration: runtime.duration(0.05),
        yoyo: true,
        repeat: 7,
        ease: "power2.inOut",
      },
    );
  });
  addDelay(runtime.timeline, runtime.duration(BASE_DURATIONS.shake));
  runtime.timeline.add(() => {
    const visualizer = runtime.getVisualizer();
    if (visualizer) {
      gsap.set(visualizer, { x: 0 });
    }
    runtime.setVisualizerError(false);
  });
}

export function playReverse(runtime: PlaybackRuntime): void {
  runtime.timeline.add(() => {
    for (const item of runtime.before) {
      runtime.setCellState(item.id, "moved");
    }
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.05 : 0.12));
  runtime.timeline.add(() => {
    runtime.commitVisual({ displayList: runtime.after, flip: true });
  });
  runtime.timeline.add(() => runtime.clearCellStates());
  runtime.timeline.add(() => runtime.revealResult());
}

export function playSort(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "sort" }>,
): void {
  runtime.timeline.add(() => {
    runtime.setDisclaimer(SORT_DISCLAIMER);
    for (const item of runtime.before) {
      runtime.setCellState(item.id, "moved");
    }
  });
  addDelay(runtime.timeline, runtime.duration(isReduced(runtime.mode) ? 0.06 : 0.16));

  if (route.secondary) {
    const sorted = Array.isArray(runtime.returnValue)
      ? runtime.returnValue
      : runtime.after;

    runtime.timeline.add(() => {
      runtime.commitVisual({
        secondary: sorted,
        secondaryLabels: {
          source: runtime.variableName,
          destination: "sorted",
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
          y: isReduced(runtime.mode) ? 0 : 8,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: runtime.duration(BASE_DURATIONS.enter),
          stagger: 0.04,
          ease: "power2.out",
        },
      );
    });
    addDelay(runtime.timeline, runtime.duration(BASE_DURATIONS.enter));
  } else {
    runtime.timeline.add(() => {
      runtime.commitVisual({ displayList: runtime.after, flip: true });
    });
  }

  runtime.timeline.add(() => runtime.clearCellStates());
  runtime.timeline.add(() => runtime.revealResult());
}

export function playStructural(runtime: PlaybackRuntime): void {
  runtime.timeline.add(() => {
    runtime.clearCellStates();
    runtime.setScanCount(null);
    runtime.setDisclaimer(null);
    runtime.commitVisual({
      displayList: runtime.after,
      incoming: [],
      secondary: null,
      secondaryLabels: null,
      flip: true,
    });
    runtime.revealResult();
  });
}
