"use client";

import { scanStepDuration } from "./timing";
import {
  addDelay,
  emphasizeResult,
  isReduced,
  type PlaybackRuntime,
} from "./runtime";
import type { PlaybackRoute } from "./playback";
import { playError } from "./reorder-animations";

function cellIdAt(runtime: PlaybackRuntime, index: number): string | null {
  return runtime.before[index]?.id ?? null;
}

export function playScan(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "scan" }>,
): void {
  const { scannedIndices, matchedIndices, purpose } = route;
  const step = scanStepDuration({
    count: scannedIndices.length,
    speed: runtime.speed,
    reducedMotion: isReduced(runtime.mode),
    simplify: runtime.mode === "simplified",
  });

  runtime.timeline.add(() => {
    runtime.setScanCount(purpose === "len" || purpose === "count" ? 0 : null);
  });

  if (runtime.mode === "simplified" && scannedIndices.length > 12) {
    runtime.timeline.add(() => {
      for (const index of scannedIndices) {
        const id = cellIdAt(runtime, index);
        if (!id) {
          continue;
        }
        runtime.setCellState(
          id,
          matchedIndices.includes(index) ? "matched" : "scanned",
        );
      }

      if (purpose === "len") {
        runtime.setScanCount(scannedIndices.length);
      } else if (purpose === "count") {
        runtime.setScanCount(matchedIndices.length);
      }
    });
    addDelay(runtime.timeline, runtime.duration(0.22));
  } else {
    let matchCount = 0;
    scannedIndices.forEach((index, stepIndex) => {
      runtime.timeline.add(() => {
        const previous = scannedIndices[stepIndex - 1];
        if (previous !== undefined && !matchedIndices.includes(previous)) {
          const previousId = cellIdAt(runtime, previous);
          if (previousId) {
            runtime.setCellState(previousId, "idle");
          }
        }

        const id = cellIdAt(runtime, index);
        if (!id) {
          return;
        }

        const isMatch = matchedIndices.includes(index);
        runtime.setCellState(id, isMatch ? "matched" : "scanned");

        if (purpose === "len") {
          runtime.setScanCount(stepIndex + 1);
        } else if (purpose === "count" && isMatch) {
          matchCount += 1;
          runtime.setScanCount(matchCount);
        }
      });
      addDelay(runtime.timeline, step);
    });
  }

  if (purpose === "index" && matchedIndices[0] !== undefined) {
    const matchId = cellIdAt(runtime, matchedIndices[0]);
    runtime.timeline.add(() => {
      if (matchId) {
        runtime.setCellState(matchId, "matched");
      }
    });
  }

  if (purpose === "remove-miss" || (purpose === "index" && matchedIndices.length === 0)) {
    playError(runtime);
    return;
  }

  if (purpose === "remove") {
    return;
  }

  runtime.timeline.add(() => runtime.revealResult());
  if (purpose === "len" || purpose === "count" || purpose === "index") {
    emphasizeResult(runtime);
  }
}

export function playRemove(
  runtime: PlaybackRuntime,
  route: Extract<PlaybackRoute, { type: "remove" }>,
): void {
  playScan(runtime, {
    type: "scan",
    scannedIndices: route.scannedIndices,
    matchedIndices: [route.removedIndex],
    purpose: "remove",
  });

  const removed = runtime.before[route.removedIndex];
  runtime.timeline.add(() => {
    if (removed) {
      runtime.setCellState(removed.id, "removed");
    }
    runtime.commitVisual({ displayList: runtime.after, flip: true });
  });
  runtime.timeline.add(() => runtime.revealResult());
}

