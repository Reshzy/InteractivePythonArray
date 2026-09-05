import {
  createList,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
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
  return createList(getPreset(id).values);
}

export const PRESET_SELECT_ITEMS = PRESETS.map((preset) => ({
  label: preset.label,
  value: preset.id,
}));
