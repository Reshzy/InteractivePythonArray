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
  PythonValue,
} from "@/lib/python/types";

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
    return `${result.error.type}. ${result.error.friendlyMessage}`;
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
