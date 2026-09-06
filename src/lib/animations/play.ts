"use client";

import type { PlaybackRoute } from "./playback";
import {
  playAppend,
  playClear,
  playCopy,
  playExtend,
  playInsert,
  playPop,
} from "./list-animations";
import { playRemove, playScan } from "./scan-animations";
import {
  playError,
  playReverse,
  playSort,
  playStructural,
} from "./reorder-animations";
import type { PlaybackRuntime } from "./runtime";

export function startPlayback(
  runtime: PlaybackRuntime,
  route: PlaybackRoute,
): void {
  if (runtime.mode === "reduced") {
    runtime.revealResult();
  }

  switch (route.type) {
    case "append":
      playAppend(runtime, route);
      break;
    case "insert":
      playInsert(runtime, route);
      break;
    case "remove":
      playRemove(runtime, route);
      break;
    case "pop":
      playPop(runtime, route);
      break;
    case "clear":
      playClear(runtime);
      break;
    case "scan":
      playScan(runtime, route);
      break;
    case "extend":
      playExtend(runtime, route);
      break;
    case "reverse":
      playReverse(runtime);
      break;
    case "sort":
      playSort(runtime, route);
      break;
    case "copy":
      playCopy(runtime);
      break;
    case "error":
      playError(runtime);
      break;
    case "structural":
      playStructural(runtime);
      break;
    case "none":
      runtime.revealResult();
      break;
  }
}
