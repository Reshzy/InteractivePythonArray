import { describe, expect, it } from "vitest";

import { createPresetList } from "@/data/presets";

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
