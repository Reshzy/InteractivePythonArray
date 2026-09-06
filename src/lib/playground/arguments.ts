import { getMethod, type MethodTryIt } from "@/data/methods";
import { typeError } from "@/lib/python/errors";
import { integerIndexError } from "@/lib/python/validation";
import { formatPythonList, formatPythonValue } from "@/lib/python/format";
import type {
  ListItem,
  MethodId,
  OperationRequest,
  PlaygroundError,
  PythonValue,
} from "@/lib/python/types";
import {
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
} from "@/lib/python/values";
import { resolveVariableName } from "@/lib/python/validation";

export type PythonValueType = PythonValue["type"];

export type ValueDraft = {
  type: PythonValueType;
  text: string;
  booleanValue: boolean;
};

export type OperationArguments = {
  value: ValueDraft;
  values: ValueDraft[];
  indexText: string;
  reverse: boolean;
};

export type BuildRequestSuccess = {
  ok: true;
  request: OperationRequest;
};

export type BuildRequestFailure = {
  ok: false;
  error: PlaygroundError;
  code: string;
};

export type BuildRequestResult = BuildRequestSuccess | BuildRequestFailure;

export const PYTHON_VALUE_TYPE_OPTIONS = [
  { value: "string", label: "str" },
  { value: "number", label: "number" },
  { value: "boolean", label: "bool" },
  { value: "none", label: "None" },
] as const;

export function isPythonValueType(value: unknown): value is PythonValueType {
  return (
    value === "string" ||
    value === "number" ||
    value === "boolean" ||
    value === "none"
  );
}

export function createValueDraft(
  type: PythonValueType = "string",
  text = "",
  booleanValue = true,
): ValueDraft {
  return { type, text, booleanValue };
}

export function createDefaultArguments(): OperationArguments {
  return {
    value: createValueDraft("string", "mango"),
    values: [createValueDraft("string", "kiwi")],
    indexText: "",
    reverse: false,
  };
}

export function cloneValueDraft(draft: ValueDraft): ValueDraft {
  return {
    type: draft.type,
    text: draft.text,
    booleanValue: draft.booleanValue,
  };
}

export function cloneArguments(args: OperationArguments): OperationArguments {
  return {
    value: cloneValueDraft(args.value),
    values: args.values.map(cloneValueDraft),
    indexText: args.indexText,
    reverse: args.reverse,
  };
}

export function valueToDraft(value: PythonValue): ValueDraft {
  switch (value.type) {
    case "string":
      return createValueDraft("string", value.value);
    case "number":
      return createValueDraft("number", String(value.value));
    case "boolean":
      return createValueDraft("boolean", "", value.value);
    case "none":
      return createValueDraft("none");
  }
}

export function coerceDraftType(
  draft: ValueDraft,
  nextType: PythonValueType,
): ValueDraft {
  if (draft.type === nextType) {
    return cloneValueDraft(draft);
  }

  if (nextType === "boolean") {
    return createValueDraft("boolean", "", true);
  }

  if (nextType === "none") {
    return createValueDraft("none");
  }

  if (nextType === "number") {
    return createValueDraft("number", draft.type === "string" && draft.text.trim() !== "" ? draft.text : "0");
  }

  if (draft.type === "number") {
    return createValueDraft("string", draft.text);
  }

  if (draft.type === "boolean") {
    return createValueDraft("string", draft.booleanValue ? "True" : "False");
  }

  if (draft.type === "none") {
    return createValueDraft("string", "None");
  }

  return createValueDraft("string", draft.text);
}

export function argumentsFromTryIt(
  method: MethodId,
  tryIt: MethodTryIt,
): OperationArguments {
  const next = createDefaultArguments();

  if (tryIt.value) {
    next.value = valueToDraft(tryIt.value);
  }

  if (tryIt.values) {
    next.values = tryIt.values.map(valueToDraft);
  }

  if (tryIt.indexText !== undefined) {
    next.indexText = tryIt.indexText;
  }

  if (tryIt.reverse !== undefined) {
    next.reverse = tryIt.reverse;
  }

  return argumentsForMethod(method, next);
}

export function argumentsForMethod(
  method: MethodId,
  previous: OperationArguments,
): OperationArguments {
  const next = cloneArguments(previous);

  if (method === "insert" && next.indexText.trim() === "") {
    next.indexText = "0";
  }

  if (method === "extend" && next.values.length === 0) {
    next.values = [cloneValueDraft(next.value)];
  }

  return next;
}

export function parseNumberText(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") {
    return null;
  }

  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(trimmed)) {
    return null;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function parseIndexText(text: string): number | "empty" | "invalid" {
  const trimmed = text.trim();
  if (trimmed === "") {
    return "empty";
  }

  if (/^[-+]?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const asNumber = Number(trimmed);
  if (!Number.isFinite(asNumber)) {
    return "invalid";
  }

  return asNumber;
}

export function parseValueDraft(draft: ValueDraft): PythonValue | PlaygroundError {
  switch (draft.type) {
    case "string":
      return pythonString(draft.text);
    case "boolean":
      return pythonBoolean(draft.booleanValue);
    case "none":
      return pythonNone();
    case "number": {
      const parsed = parseNumberText(draft.text);
      if (parsed === null) {
        return invalidNumberError();
      }
      return pythonNumber(parsed);
    }
  }
}

function invalidNumberError(): PlaygroundError {
  return typeError(
    "could not convert string to float",
    "That value is not a valid number.",
    "Use digits, such as 3 or 3.14.",
  );
}

function formatDraftLoose(draft: ValueDraft): string {
  if (draft.type === "string") {
    return formatPythonValue(pythonString(draft.text));
  }

  if (draft.type === "boolean") {
    return draft.booleanValue ? "True" : "False";
  }

  if (draft.type === "none") {
    return "None";
  }

  const trimmed = draft.text.trim();
  return trimmed === "" ? "..." : trimmed;
}

export function attemptedOperationCode(
  variableName: string,
  method: MethodId,
  args: OperationArguments,
): string {
  const variable = resolveVariableName(variableName);
  const value = formatDraftLoose(args.value);
  const values = `[${args.values.map(formatDraftLoose).join(", ")}]`;
  const reverseFlag = args.reverse ? ", reverse=True" : "";
  const index = args.indexText.trim() === "" ? "..." : args.indexText.trim();

  switch (method) {
    case "len":
      return `len(${variable})`;
    case "sorted":
      return `sorted(${variable}${reverseFlag})`;
    case "append":
      return `${variable}.append(${value})`;
    case "extend":
      return `${variable}.extend(${values})`;
    case "insert":
      return `${variable}.insert(${index}, ${value})`;
    case "remove":
      return `${variable}.remove(${value})`;
    case "pop":
      return args.indexText.trim() === ""
        ? `removed = ${variable}.pop()`
        : `removed = ${variable}.pop(${index})`;
    case "clear":
      return `${variable}.clear()`;
    case "count":
      return `${variable}.count(${value})`;
    case "index":
      return `${variable}.index(${value})`;
    case "reverse":
      return `${variable}.reverse()`;
    case "sort":
      return `${variable}.sort(${args.reverse ? "reverse=True" : ""})`;
    case "copy":
      return `copied = ${variable}.copy()`;
  }
}

export function isPlaygroundError(
  value: PythonValue | PlaygroundError,
): value is PlaygroundError {
  return "friendlyMessage" in value;
}

function parseRequiredValue(
  draft: ValueDraft,
  variableName: string,
  method: MethodId,
  args: OperationArguments,
): PythonValue | BuildRequestFailure {
  const parsed = parseValueDraft(draft);
  if (isPlaygroundError(parsed)) {
    return {
      ok: false,
      error: parsed,
      code: attemptedOperationCode(variableName, method, args),
    };
  }

  return parsed;
}

export function buildOperationRequest(params: {
  list: ListItem[];
  variableName: string;
  method: MethodId;
  arguments: OperationArguments;
}): BuildRequestResult {
  const { list, variableName, method } = params;
  const args = params.arguments;
  const schema = getMethod(method).argumentSchema;
  const needsValue = schema.some((argument) => argument.kind === "value");
  const needsValues = schema.some((argument) => argument.kind === "values");
  const indexSchema = schema.find((argument) => argument.kind === "index");

  let value: PythonValue | undefined;
  if (needsValue) {
    const parsed = parseRequiredValue(args.value, variableName, method, args);
    if ("ok" in parsed) {
      return parsed;
    }
    value = parsed;
  }

  let values: PythonValue[] | undefined;
  if (needsValues) {
    values = [];
    for (const draft of args.values) {
      const parsed = parseRequiredValue(draft, variableName, method, args);
      if ("ok" in parsed) {
        return parsed;
      }
      values.push(parsed);
    }
  }

  let index: number | undefined;
  if (indexSchema) {
    const parsedIndex = parseIndexText(args.indexText);
    if (parsedIndex === "empty") {
      if (indexSchema.required) {
        return {
          ok: false,
          error: integerIndexError(method === "pop" ? "pop" : "insert"),
          code: attemptedOperationCode(variableName, method, args),
        };
      }
    } else if (parsedIndex === "invalid") {
      return {
        ok: false,
        error: integerIndexError(method === "pop" ? "pop" : "insert"),
        code: attemptedOperationCode(variableName, method, args),
      };
    } else {
      index = parsedIndex;
    }
  }

  const base = { list, variableName };

  switch (method) {
    case "len":
      return { ok: true, request: { ...base, method } };
    case "clear":
      return { ok: true, request: { ...base, method } };
    case "copy":
      return { ok: true, request: { ...base, method } };
    case "reverse":
      return { ok: true, request: { ...base, method } };
    case "append":
      return {
        ok: true,
        request: { ...base, method, args: { value: value as PythonValue } },
      };
    case "count":
      return {
        ok: true,
        request: { ...base, method, args: { value: value as PythonValue } },
      };
    case "index":
      return {
        ok: true,
        request: { ...base, method, args: { value: value as PythonValue } },
      };
    case "remove":
      return {
        ok: true,
        request: { ...base, method, args: { value: value as PythonValue } },
      };
    case "extend":
      return {
        ok: true,
        request: { ...base, method, args: { values: values ?? [] } },
      };
    case "insert":
      return {
        ok: true,
        request: {
          ...base,
          method,
          args: { index: index as number, value: value as PythonValue },
        },
      };
    case "pop":
      return {
        ok: true,
        request:
          index === undefined
            ? { ...base, method }
            : { ...base, method, args: { index } },
      };
    case "sort":
      return {
        ok: true,
        request: { ...base, method, args: { reverse: args.reverse } },
      };
    case "sorted":
      return {
        ok: true,
        request: { ...base, method, args: { reverse: args.reverse } },
      };
  }
}

export function formatPythonListAssignment(
  variableName: string,
  list: readonly ListItem[],
): string {
  return `${resolveVariableName(variableName)} = ${formatPythonList(list)}`;
}
