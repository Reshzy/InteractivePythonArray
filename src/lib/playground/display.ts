import {
  attemptedOperationCode,
  buildOperationRequest,
  formatPythonListAssignment,
  type OperationArguments,
} from "@/lib/playground/arguments";
import { executeOperation } from "@/lib/python/operations";
import { formatPythonList, formatPythonValue } from "@/lib/python/format";
import type {
  ListItem,
  MethodId,
  OperationResult,
  PlaygroundError,
  PythonValue,
} from "@/lib/python/types";

const EXACT_ERROR_MESSAGE_MAX_LENGTH = 120;

export function shouldShowExactErrorMessage(error: PlaygroundError): boolean {
  const exact = error.message.trim();
  if (!exact || exact.length > EXACT_ERROR_MESSAGE_MAX_LENGTH) {
    return false;
  }

  return exact !== error.friendlyMessage.trim();
}

export function formatReturnValue(
  value: PythonValue | ListItem[] | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  if (Array.isArray(value)) {
    return formatPythonList(value);
  }

  return formatPythonValue(value);
}

export function previewOperationCode(params: {
  list: ListItem[];
  variableName: string;
  method: MethodId;
  arguments: OperationArguments;
}): string {
  const built = buildOperationRequest(params);
  if (!built.ok) {
    return built.code;
  }

  return executeOperation(built.request).code;
}

export function buildPlaygroundSource(params: {
  list: ListItem[];
  variableName: string;
  method: MethodId;
  arguments: OperationArguments;
}): string {
  const assignment = formatPythonListAssignment(params.variableName, params.list);
  const operation = previewOperationCode(params);
  return `${assignment}\n\n${operation}`;
}

export function buildResultAnnouncement(
  result: OperationResult,
  listLength: number,
): string {
  if (result.error) {
    const guidance = result.error.guidance ? ` ${result.error.guidance}` : "";
    return `${result.error.type}. ${result.error.friendlyMessage}${guidance}`;
  }

  const countLabel = listLength === 1 ? "1 item" : `${listLength} items`;
  if (result.mutates) {
    return `${result.explanation} List now contains ${countLabel}.`;
  }

  return result.explanation;
}

export function attemptedCodeFromResult(
  variableName: string,
  method: MethodId,
  args: OperationArguments,
  result?: OperationResult,
): string {
  return result?.code ?? attemptedOperationCode(variableName, method, args);
}
