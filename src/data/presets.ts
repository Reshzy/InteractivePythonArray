import {
  createListItem,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
  pythonValueEquals,
} from "@/lib/python";
import type { ListItem, PythonValue } from "@/lib/python/types";

export const PRESET_IDS = [
  "fruits",
  "numbers",
  "duplicates",
  "mixed",
  "empty",
  "reverseOrder",
] as const;

export type PresetId = (typeof PRESET_IDS)[number];

export type ListPreset = {
  id: PresetId;
  label: string;
  variableName: string;
  values: readonly PythonValue[];
};

export const PRESETS: readonly ListPreset[] = [
  {
    id: "fruits",
    label: "Fruits",
    variableName: "fruits",
    values: [
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ],
  },
  {
    id: "numbers",
    label: "Numbers",
    variableName: "numbers",
    values: [
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ],
  },
  {
    id: "duplicates",
    label: "Duplicates",
    variableName: "duplicates",
    values: [
      pythonString("A"),
      pythonString("B"),
      pythonString("A"),
      pythonString("C"),
      pythonString("A"),
    ],
  },
  {
    id: "mixed",
    label: "Mixed values",
    variableName: "mixed",
    values: [
      pythonString("Python"),
      pythonNumber(42),
      pythonBoolean(true),
      pythonNone(),
    ],
  },
  {
    id: "empty",
    label: "Empty list",
    variableName: "items",
    values: [],
  },
  {
    id: "reverseOrder",
    label: "Reverse order",
    variableName: "countdown",
    values: [
      pythonNumber(9),
      pythonNumber(7),
      pythonNumber(5),
      pythonNumber(3),
      pythonNumber(1),
    ],
  },
] as const;

export const DEFAULT_PRESET_ID: PresetId = "fruits";

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === "string" && PRESET_IDS.some((id) => id === value);
}

export function getPreset(id: PresetId): ListPreset {
  const preset = PRESETS.find((item) => item.id === id);
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`);
  }
  return preset;
}

export function createPresetList(id: PresetId): ListItem[] {
  return getPreset(id).values.map((value, index) =>
    createListItem(value, `preset:${id}:${index}`),
  );
}

export const PRESET_SELECT_ITEMS = PRESETS.map((preset) => ({
  label: preset.label,
  value: preset.id,
}));

export const PRESET_CUSTOM_VALUE = "custom";

export function editedPresetValue(id: PresetId): string {
  return `edited:${id}`;
}

export function listMatchesPreset(
  list: readonly ListItem[],
  variableName: string,
  id: PresetId,
): boolean {
  const preset = getPreset(id);
  if (variableName !== preset.variableName) {
    return false;
  }
  if (list.length !== preset.values.length) {
    return false;
  }
  return list.every((item, index) => {
    const expected = preset.values[index];
    return expected !== undefined && pythonValueEquals(item.value, expected);
  });
}

export function resolvePresetSelection(
  list: readonly ListItem[],
  variableName: string,
  presetSource: PresetId | null,
): {
  selectedPreset: PresetId | null;
  presetSource: PresetId | null;
} {
  if (presetSource && listMatchesPreset(list, variableName, presetSource)) {
    return { selectedPreset: presetSource, presetSource };
  }
  return { selectedPreset: null, presetSource };
}

export function presetSelectState(
  selectedPreset: PresetId | null,
  presetSource: PresetId | null,
): {
  value: string;
  items: { value: string; label: string }[];
} {
  const items = [...PRESET_SELECT_ITEMS];
  if (selectedPreset) {
    return { value: selectedPreset, items };
  }
  if (presetSource) {
    const extra = {
      value: editedPresetValue(presetSource),
      label: `${getPreset(presetSource).label} (edited)`,
    };
    return { value: extra.value, items: [...items, extra] };
  }
  const custom = { value: PRESET_CUSTOM_VALUE, label: "Custom" };
  return { value: custom.value, items: [...items, custom] };
}
