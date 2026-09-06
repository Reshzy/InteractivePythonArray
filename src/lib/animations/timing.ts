import type { AnimationSpeed } from "@/data/playground-demo";

export const BASE_DURATIONS = {
  fade: 0.28,
  enter: 0.4,
  flip: 0.55,
  scanStep: 0.18,
  pulse: 0.28,
  shake: 0.32,
  staggerEach: 0.06,
  resultEmphasis: 0.22,
  reduced: 0.12,
} as const;

export const MAX_STAGGER_TOTAL = 0.7;

export const LARGE_LIST_THRESHOLD = 20;

export function scaleDuration(baseSeconds: number, speed: AnimationSpeed): number {
  return baseSeconds / speed;
}

export function cappedStagger(params: {
  each: number;
  count: number;
  maxTotal?: number;
}): number {
  if (params.count <= 1) {
    return 0;
  }

  const maxTotal = params.maxTotal ?? MAX_STAGGER_TOTAL;
  const gaps = params.count - 1;
  const natural = params.each * gaps;
  if (natural <= maxTotal) {
    return params.each;
  }

  return maxTotal / gaps;
}

export function scanStepDuration(params: {
  count: number;
  speed: AnimationSpeed;
  reducedMotion: boolean;
  simplify: boolean;
}): number {
  const { count, speed, reducedMotion, simplify } = params;

  if (reducedMotion) {
    return scaleDuration(0.04, speed);
  }

  if (simplify || count >= LARGE_LIST_THRESHOLD) {
    return scaleDuration(0.05, speed);
  }

  return scaleDuration(BASE_DURATIONS.scanStep, speed);
}

export function stepAutoplayDelayMs(
  speed: AnimationSpeed,
  reducedMotion: boolean,
): number {
  return scanStepDuration({
    count: 1,
    speed,
    reducedMotion,
    simplify: false,
  }) * 1000 + 420;
}
