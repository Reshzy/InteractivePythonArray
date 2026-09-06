import type { PlaygroundError, PlaygroundErrorType } from "./types";

export function createPlaygroundError(
  type: PlaygroundErrorType,
  message: string,
  friendlyMessage: string,
  guidance?: string,
): PlaygroundError {
  if (guidance) {
    return { type, message, friendlyMessage, guidance };
  }

  return { type, message, friendlyMessage };
}

export function valueError(
  message: string,
  friendlyMessage: string,
  guidance?: string,
): PlaygroundError {
  return createPlaygroundError("ValueError", message, friendlyMessage, guidance);
}

export function indexError(
  message: string,
  friendlyMessage: string,
  guidance?: string,
): PlaygroundError {
  return createPlaygroundError("IndexError", message, friendlyMessage, guidance);
}

export function typeError(
  message: string,
  friendlyMessage: string,
  guidance?: string,
): PlaygroundError {
  return createPlaygroundError("TypeError", message, friendlyMessage, guidance);
}
