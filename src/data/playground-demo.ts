export const DEMO_VARIABLE_NAME = "fruits";

export const DEMO_SELECTED_METHOD_ID = "append";

export const DEMO_APPEND_VALUE = "mango";

export const ANIMATION_SPEEDS = [0.5, 1, 1.5, 2] as const;

export type AnimationSpeed = (typeof ANIMATION_SPEEDS)[number];

export const DEFAULT_ANIMATION_SPEED: AnimationSpeed = 1;

export const ANIMATION_SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
] as const;

export function isAnimationSpeed(value: unknown): value is AnimationSpeed {
  return ANIMATION_SPEEDS.some((speed) => speed === value);
}

export function animationSpeedLabel(speed: AnimationSpeed): string {
  const option = ANIMATION_SPEED_OPTIONS.find((item) => item.value === speed);
  return option?.label ?? `${speed}x`;
}
