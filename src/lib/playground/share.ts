import { isMethodId } from "@/data/methods";
import {
  createPresetList,
  DEFAULT_PRESET_ID,
  getPreset,
  isPresetId,
  type PresetId,
} from "@/data/presets";
import {
  argumentsForMethod,
  cloneArguments,
  createDefaultArguments,
  isPythonValueType,
  type OperationArguments,
  type ValueDraft,
} from "@/lib/playground/arguments";
import type { ListItem, MethodId, PythonValue } from "@/lib/python/types";
import {
  createList,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
  pythonValueEquals,
} from "@/lib/python/values";

export const SHARE_VERSION = "v1";
export const SHARE_PATH = "/playground";

type EncodedValue =
  | { t: "s"; v: string }
  | { t: "n"; v: number }
  | { t: "b"; v: boolean }
  | { t: "z" };

type EncodedDraft = {
  t: "s" | "n" | "b" | "z";
  text: string;
  b: boolean;
};

type SharePayloadV1 = {
  v: 1;
  name: string;
  list: EncodedValue[];
  method: MethodId;
  args: {
    value: EncodedDraft;
    values: EncodedDraft[];
    index: string;
    reverse: boolean;
  };
};

export type SharedPlaygroundState = {
  variableName: string;
  list: ListItem[];
  selectedMethod: MethodId;
  arguments: OperationArguments;
  selectedPreset: PresetId | null;
};

export type ShareParseSuccess = {
  ok: true;
  snapshot: SharedPlaygroundState;
};

export type ShareParseFailure = {
  ok: false;
  reason: "empty" | "invalid";
};

export type ShareParseResult = ShareParseSuccess | ShareParseFailure;

export type ShareablePlayground = {
  variableName: string;
  list: readonly ListItem[];
  selectedMethod: MethodId;
  arguments: OperationArguments;
  selectedPreset: PresetId | null;
};

function encodePythonValue(value: PythonValue): EncodedValue {
  switch (value.type) {
    case "string":
      return { t: "s", v: value.value };
    case "number":
      return { t: "n", v: value.value };
    case "boolean":
      return { t: "b", v: value.value };
    case "none":
      return { t: "z" };
  }
}

function decodePythonValue(value: unknown): PythonValue | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const encoded = value as { t?: unknown; v?: unknown };
  if (encoded.t === "s" && typeof encoded.v === "string") {
    return pythonString(encoded.v);
  }
  if (
    encoded.t === "n" &&
    typeof encoded.v === "number" &&
    Number.isFinite(encoded.v)
  ) {
    return pythonNumber(encoded.v);
  }
  if (encoded.t === "b" && typeof encoded.v === "boolean") {
    return pythonBoolean(encoded.v);
  }
  if (encoded.t === "z") {
    return pythonNone();
  }
  return null;
}

function encodeDraft(draft: ValueDraft): EncodedDraft {
  return {
    t:
      draft.type === "string"
        ? "s"
        : draft.type === "number"
          ? "n"
          : draft.type === "boolean"
            ? "b"
            : "z",
    text: draft.text,
    b: draft.booleanValue,
  };
}

function decodeDraft(value: unknown): ValueDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const encoded = value as { t?: unknown; text?: unknown; b?: unknown };
  const type =
    encoded.t === "s"
      ? "string"
      : encoded.t === "n"
        ? "number"
        : encoded.t === "b"
          ? "boolean"
          : encoded.t === "z"
            ? "none"
            : null;

  if (
    !type ||
    !isPythonValueType(type) ||
    typeof encoded.text !== "string" ||
    typeof encoded.b !== "boolean"
  ) {
    return null;
  }

  return {
    type,
    text: encoded.text,
    booleanValue: encoded.b,
  };
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const binary = atob(`${padded}${"=".repeat(padLength)}`);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function encodePayload(state: ShareablePlayground): string {
  const payload: SharePayloadV1 = {
    v: 1,
    name: state.variableName,
    list: state.list.map((item) => encodePythonValue(item.value)),
    method: state.selectedMethod,
    args: {
      value: encodeDraft(state.arguments.value),
      values: state.arguments.values.map(encodeDraft),
      index: state.arguments.indexText,
      reverse: state.arguments.reverse,
    },
  };

  return `${SHARE_VERSION}.${toBase64Url(JSON.stringify(payload))}`;
}

function decodePayload(raw: string): SharedPlaygroundState | null {
  if (!raw.startsWith(`${SHARE_VERSION}.`)) {
    return null;
  }

  const json = fromBase64Url(raw.slice(SHARE_VERSION.length + 1));
  if (json === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const payload = parsed as {
    v?: unknown;
    name?: unknown;
    list?: unknown;
    method?: unknown;
    args?: unknown;
  };

  if (payload.v !== 1 || typeof payload.name !== "string") {
    return null;
  }

  if (!isMethodId(payload.method)) {
    return null;
  }

  if (!Array.isArray(payload.list)) {
    return null;
  }

  const values: PythonValue[] = [];
  for (const item of payload.list) {
    const decoded = decodePythonValue(item);
    if (!decoded) {
      return null;
    }
    values.push(decoded);
  }

  if (!payload.args || typeof payload.args !== "object") {
    return null;
  }

  const args = payload.args as {
    value?: unknown;
    values?: unknown;
    index?: unknown;
    reverse?: unknown;
  };

  const value = decodeDraft(args.value);
  if (!value || !Array.isArray(args.values) || typeof args.index !== "string") {
    return null;
  }

  const valuesDraft: ValueDraft[] = [];
  for (const draft of args.values) {
    const decoded = decodeDraft(draft);
    if (!decoded) {
      return null;
    }
    valuesDraft.push(decoded);
  }

  if (typeof args.reverse !== "boolean") {
    return null;
  }

  return {
    variableName: payload.name,
    list: createList(values),
    selectedMethod: payload.method,
    arguments: {
      value,
      values: valuesDraft,
      indexText: args.index,
      reverse: args.reverse,
    },
    selectedPreset: null,
  };
}

function listMatchesPreset(
  list: readonly ListItem[],
  variableName: string,
  presetId: PresetId,
): boolean {
  const preset = getPreset(presetId);
  if (variableName !== preset.variableName || list.length !== preset.values.length) {
    return false;
  }

  return list.every((item, index) => {
    const expected = preset.values[index];
    return expected !== undefined && pythonValueEquals(item.value, expected);
  });
}

function argumentsMatchDefaults(
  method: MethodId,
  args: OperationArguments,
): boolean {
  const defaults = argumentsForMethod(method, createDefaultArguments());
  return JSON.stringify(cloneArguments(args)) === JSON.stringify(defaults);
}

export function buildSharePath(state: ShareablePlayground): string {
  const params = new URLSearchParams();
  const preset = state.selectedPreset;

  if (
    preset &&
    listMatchesPreset(state.list, state.variableName, preset) &&
    argumentsMatchDefaults(state.selectedMethod, state.arguments)
  ) {
    params.set("preset", preset);
    params.set("method", state.selectedMethod);
    return `${SHARE_PATH}?${params.toString()}`;
  }

  params.set("s", encodePayload(state));
  return `${SHARE_PATH}?${params.toString()}`;
}

export function buildShareUrl(state: ShareablePlayground, origin: string): string {
  return new URL(buildSharePath(state), origin).toString();
}

export function parseShareSearchParams(
  params: URLSearchParams,
): ShareParseResult {
  const encoded = params.get("s");
  if (encoded !== null && encoded !== "") {
    const snapshot = decodePayload(encoded);
    if (!snapshot) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, snapshot };
  }

  const methodParam = params.get("method");
  const presetParam = params.get("preset");

  if (methodParam === null && presetParam === null) {
    return { ok: false, reason: "empty" };
  }

  if (methodParam !== null && !isMethodId(methodParam)) {
    return { ok: false, reason: "invalid" };
  }

  if (presetParam !== null && !isPresetId(presetParam)) {
    return { ok: false, reason: "invalid" };
  }

  const method = isMethodId(methodParam) ? methodParam : "append";
  const presetId = isPresetId(presetParam) ? presetParam : DEFAULT_PRESET_ID;
  const preset = getPreset(presetId);

  return {
    ok: true,
    snapshot: {
      variableName: preset.variableName,
      list: createPresetList(presetId),
      selectedMethod: method,
      arguments: argumentsForMethod(method, createDefaultArguments()),
      selectedPreset: presetId,
    },
  };
}
