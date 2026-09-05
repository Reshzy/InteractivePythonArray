import type { PlaygroundError, PlaygroundErrorType } from "./types";

export function createPlaygroundError(
  type: PlaygroundErrorType,
  message: string,
  friendlyMessage: string,
): PlaygroundError {
  return { type, message, friendlyMessage };
}

export function valueError(
  message: string,
  friendlyMessage: string,
): PlaygroundError {
  return createPlaygroundError("ValueError", message, friendlyMessage);
}

export function indexError(
  message: string,
  friendlyMessage: string,
): PlaygroundError {
  return createPlaygroundError("IndexError", message, friendlyMessage);
}

export function typeError(
  message: string,
  friendlyMessage: string,
): PlaygroundError {
  return createPlaygroundError("TypeError", message, friendlyMessage);
}
