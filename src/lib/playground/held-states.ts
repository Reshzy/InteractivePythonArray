import type { CellVisualState } from "@/lib/animations/highlights";
import type { OperationResult } from "@/lib/python/types";

export function heldCellStatesFromResult(
  result: OperationResult | null,
  listLength: number,
): CellVisualState[] | undefined {
  if (!result || listLength < 0) {
    return undefined;
  }

  const states: CellVisualState[] = Array.from(
    { length: listLength },
    () => "idle",
  );
  const animation = result.animation;

  if (result.error) {
    if (animation.type === "scan") {
      for (const index of animation.scannedIndices) {
        if (index >= 0 && index < listLength) {
          states[index] = "error";
        }
      }
    }
    return states;
  }

  switch (animation.type) {
    case "append":
      if (animation.addedIndex >= 0 && animation.addedIndex < listLength) {
        states[animation.addedIndex] = "inserted";
      }
      break;
    case "insert":
      if (
        animation.insertedIndex >= 0 &&
        animation.insertedIndex < listLength
      ) {
        states[animation.insertedIndex] = "inserted";
      }
      break;
    case "extend":
      for (const index of animation.addedIndices) {
        if (index >= 0 && index < listLength) {
          states[index] = "inserted";
        }
      }
      break;
    case "scan":
      for (const index of animation.matchedIndices) {
        if (index >= 0 && index < listLength) {
          states[index] = "matched";
        }
      }
      break;
    case "reverse":
    case "sort":
      for (let index = 0; index < listLength; index += 1) {
        states[index] = "moved";
      }
      break;
    case "copy":
      break;
    default:
      break;
  }

  return states.some((state) => state !== "idle") ? states : undefined;
}
