"use client";

import type { AnimationSpeed } from "@/data/playground-demo";
import type { ListItem, MethodId, PythonValue } from "@/lib/python/types";
import type { gsap } from "@/lib/animations/gsap-client";

import type { CellVisualState } from "./highlights";
import type { PlaybackRoute, SecondaryLabels } from "./playback";
import type { AnimationMode } from "./reduced-motion";

export type GsapTimeline = ReturnType<typeof gsap.timeline>;

export type VisualCommit = {
  displayList?: ListItem[];
  incoming?: ListItem[];
  secondary?: ListItem[] | null;
  secondaryLabels?: SecondaryLabels | null;
  flip?: boolean;
};

export type PlaybackRuntime = {
  root: HTMLElement;
  timeline: GsapTimeline;
  speed: AnimationSpeed;
  mode: AnimationMode;
  before: ListItem[];
  after: ListItem[];
  returnValue?: PythonValue | ListItem[];
  variableName: string;
  method: MethodId;
  duration: (baseSeconds: number) => number;
  getMainCells: () => HTMLElement[];
  getCellById: (id: string) => HTMLElement | null;
  getIncomingCells: () => HTMLElement[];
  getSecondaryCells: () => HTMLElement[];
  getVisualizer: () => HTMLElement | null;
  getResultReturns: () => HTMLElement | null;
  setCellState: (id: string, state: CellVisualState) => void;
  clearCellStates: () => void;
  setVisualizerError: (error: boolean) => void;
  commitVisual: (patch: VisualCommit) => void;
  setScanCount: (value: number | null) => void;
  setDisclaimer: (text: string | null) => void;
  revealResult: () => void;
};

export function addDelay(timeline: GsapTimeline, seconds: number): void {
  if (seconds <= 0) {
    return;
  }

  timeline.to({}, { duration: seconds });
}

export function listIdsFrom(items: readonly ListItem[]): string[] {
  return items.map((item) => item.id);
}

export function isReduced(mode: AnimationMode): boolean {
  return mode === "reduced";
}

export function isSimplified(mode: AnimationMode): boolean {
  return mode === "simplified" || mode === "reduced";
}

export function shouldFlipLayout(mode: AnimationMode): boolean {
  return !isReduced(mode);
}

export function emphasizeResult(runtime: PlaybackRuntime): void {
  const el = runtime.getResultReturns();
  if (!el || isReduced(runtime.mode)) {
    return;
  }

  runtime.timeline.to(el, {
    scale: 1.05,
    duration: runtime.duration(0.16),
    yoyo: true,
    repeat: 1,
    ease: "power2.out",
    transformOrigin: "left center",
  });
}

export function pulseInserted(runtime: PlaybackRuntime, id: string): void {
  runtime.timeline.add(() => {
    runtime.setCellState(id, "inserted");
  });
  addDelay(runtime.timeline, runtime.duration(runtime.mode === "reduced" ? 0.08 : 0.22));
  runtime.timeline.add(() => {
    runtime.setCellState(id, "idle");
  });
}

export type { PlaybackRoute };
