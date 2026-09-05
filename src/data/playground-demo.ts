export const DEMO_VARIABLE_NAME = "fruits";

export const DEMO_LIST_VALUES = ["apple", "banana", "orange"] as const;

export const DEMO_SELECTED_METHOD_ID = "append";

export const DEMO_APPEND_VALUE = "mango";

export const DEMO_PYTHON_CODE = `${DEMO_VARIABLE_NAME} = ["apple", "banana", "orange"]

${DEMO_VARIABLE_NAME}.append("mango")`;

export const PRESET_OPTIONS = [
  { label: "Fruits", value: "fruits" },
  { label: "Numbers", value: "numbers" },
  { label: "Duplicates", value: "duplicates" },
  { label: "Mixed values", value: "mixed" },
  { label: "Empty list", value: "empty" },
] as const;

export const ANIMATION_SPEEDS = ["0.5x", "1x", "1.5x", "2x"] as const;

export const DEFAULT_ANIMATION_SPEED = "1x";
