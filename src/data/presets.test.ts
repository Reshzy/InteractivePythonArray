import { describe, expect, it } from "vitest";

import { createPresetList, listMatchesPreset, presetSelectState } from "@/data/presets";
import { pythonString } from "@/lib/python";

describe("createPresetList", () => {
  it("assigns stable IDs so the default playground can hydrate without mismatch", () => {
    const first = createPresetList("fruits");
    const second = createPresetList("fruits");

    expect(first.map((item) => item.id)).toEqual([
      "preset:fruits:0",
      "preset:fruits:1",
      "preset:fruits:2",
    ]);
    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id));
  });
});

describe("preset display", () => {
  it("keeps Fruits when the list still matches", () => {
    const list = createPresetList("fruits");
    expect(listMatchesPreset(list, "fruits", "fruits")).toBe(true);
    expect(presetSelectState("fruits", "fruits").value).toBe("fruits");
  });

  it("labels a mutated fruits list as Fruits (edited)", () => {
    const list = createPresetList("fruits");
    list.push({ id: "extra", value: pythonString("mango") });
    expect(listMatchesPreset(list, "fruits", "fruits")).toBe(false);
    const display = presetSelectState(null, "fruits");
    expect(display.value).toBe("edited:fruits");
    expect(display.items).toContainEqual({
      value: "edited:fruits",
      label: "Fruits (edited)",
    });
  });
});
