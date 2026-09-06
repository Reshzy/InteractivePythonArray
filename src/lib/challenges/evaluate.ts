import type { Challenge } from "@/data/challenges";
import { getMethod } from "@/data/methods";
import type {
  ListItem,
  MethodId,
  OperationResult,
  PythonValue,
} from "@/lib/python/types";
import { pythonValueEquals } from "@/lib/python/values";

export type ChallengeVerdictStatus = "idle" | "correct" | "incorrect";

export type ChallengeVerdict = {
  status: ChallengeVerdictStatus;
  title: string;
  message: string;
};

export const IDLE_VERDICT: ChallengeVerdict = {
  status: "idle",
  title: "",
  message: "",
};

export type ChallengeAttempt = {
  method: MethodId;
  after: readonly ListItem[];
  result: OperationResult;
};

export function pythonValuesEqual(
  left: readonly PythonValue[],
  right: readonly PythonValue[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => {
    const other = right[index];
    return other !== undefined && pythonValueEquals(value, other);
  });
}

function listItemValues(list: readonly ListItem[]): PythonValue[] {
  return list.map((item) => item.value);
}

function returnValueMatches(
  challenge: Challenge,
  result: OperationResult,
): boolean {
  const expected = challenge.expectedReturnValue;
  if (expected === undefined) {
    return true;
  }

  if (expected === "list-copy") {
    if (!Array.isArray(result.returnValue)) {
      return false;
    }

    return pythonValuesEqual(
      listItemValues(result.returnValue),
      [...challenge.initialList],
    );
  }

  if (result.returnValue === undefined || Array.isArray(result.returnValue)) {
    return false;
  }

  return pythonValueEquals(result.returnValue, expected);
}

export function evaluateChallenge(
  challenge: Challenge,
  attempt: ChallengeAttempt,
): ChallengeVerdict {
  if (attempt.result.error) {
    const guidance = attempt.result.error.guidance
      ? ` ${attempt.result.error.guidance}`
      : "";
    return {
      status: "incorrect",
      title: "Not quite yet.",
      message: `${attempt.result.error.friendlyMessage}${guidance}`,
    };
  }

  if (
    challenge.expectedMethod &&
    attempt.method !== challenge.expectedMethod
  ) {
    const methodLabel = getMethod(challenge.expectedMethod).label;
    return {
      status: "incorrect",
      title: "Not quite yet.",
      message: `This challenge asks for ${methodLabel}. Try that method in the playground.`,
    };
  }

  if (
    challenge.allowedMethods &&
    challenge.allowedMethods.length > 0 &&
    !challenge.allowedMethods.includes(attempt.method)
  ) {
    return {
      status: "incorrect",
      title: "Not quite yet.",
      message: "This challenge wants a different method. Check the prompt and try again.",
    };
  }

  if (
    challenge.targetList &&
    !pythonValuesEqual(listItemValues(attempt.after), [...challenge.targetList])
  ) {
    return {
      status: "incorrect",
      title: "Not quite yet.",
      message: "Your list is close, but compare it with the goal.",
    };
  }

  if (!returnValueMatches(challenge, attempt.result)) {
    return {
      status: "incorrect",
      title: "Not quite yet.",
      message: "Check the return value — it should match what this challenge asks for.",
    };
  }

  return {
    status: "correct",
    title: "Correct",
    message: challenge.explanation,
  };
}
