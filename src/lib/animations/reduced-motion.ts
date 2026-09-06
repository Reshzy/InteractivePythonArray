import { LARGE_LIST_THRESHOLD } from "./timing";

export type AnimationMode = "full" | "reduced" | "simplified";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resolveAnimationMode(params: {
  prefersReducedMotion: boolean;
  listLength: number;
}): AnimationMode {
  if (params.prefersReducedMotion) {
    return "reduced";
  }

  if (params.listLength >= LARGE_LIST_THRESHOLD) {
    return "simplified";
  }

  return "full";
}
