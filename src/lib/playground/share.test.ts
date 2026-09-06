import { describe, expect, it } from "vitest";

import { createDefaultArguments } from "@/lib/playground/arguments";
import { createList, pythonNumber, pythonString } from "@/lib/python/values";

import {
  buildSharePath,
  parseShareSearchParams,
  type ShareablePlayground,
} from "./share";

const fruitsShare = (): ShareablePlayground => ({
  variableName: "fruits",
  list: createList([
    pythonString("apple"),
    pythonString("banana"),
    pythonString("orange"),
  ]),
  selectedMethod: "append",
  arguments: createDefaultArguments(),
  selectedPreset: "fruits",
});

describe("parseShareSearchParams", () => {
  it("treats an empty query as a no-op", () => {
    expect(parseShareSearchParams(new URLSearchParams())).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("loads a preset and method deep link", () => {
    const parsed = parseShareSearchParams(
      new URLSearchParams("preset=fruits&method=append"),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.snapshot.selectedPreset).toBe("fruits");
    expect(parsed.snapshot.selectedMethod).toBe("append");
    expect(parsed.snapshot.variableName).toBe("fruits");
    expect(parsed.snapshot.list.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ]);
  });

  it("uses the default fruits preset for method-only links", () => {
    const parsed = parseShareSearchParams(new URLSearchParams("method=reverse"));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.snapshot.selectedMethod).toBe("reverse");
    expect(parsed.snapshot.selectedPreset).toBe("fruits");
    expect(parsed.snapshot.list).toHaveLength(3);
  });

  it("ignores malformed encoded state and unknown methods", () => {
    expect(
      parseShareSearchParams(new URLSearchParams("s=not-valid")),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      parseShareSearchParams(new URLSearchParams("s=v1.!!!")),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      parseShareSearchParams(new URLSearchParams("method=not-a-method")),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      parseShareSearchParams(new URLSearchParams("preset=nope&method=append")),
    ).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("buildSharePath", () => {
  it("uses preset query params for an unchanged preset", () => {
    expect(buildSharePath(fruitsShare())).toBe(
      "/playground?preset=fruits&method=append",
    );
  });

  it("round-trips a custom list through the encoded payload", () => {
    const custom: ShareablePlayground = {
      variableName: "nums",
      list: createList([pythonNumber(1), pythonNumber(2)]),
      selectedMethod: "insert",
      arguments: {
        ...createDefaultArguments(),
        value: { type: "number", text: "9", booleanValue: true },
        indexText: "1",
        reverse: false,
      },
      selectedPreset: null,
    };

    const path = buildSharePath(custom);
    expect(path.startsWith("/playground?s=v1.")).toBe(true);

    const params = new URLSearchParams(path.slice(path.indexOf("?") + 1));
    const parsed = parseShareSearchParams(params);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.snapshot.variableName).toBe("nums");
    expect(parsed.snapshot.selectedMethod).toBe("insert");
    expect(parsed.snapshot.arguments.indexText).toBe("1");
    expect(parsed.snapshot.arguments.value).toEqual({
      type: "number",
      text: "9",
      booleanValue: true,
    });
    expect(parsed.snapshot.list.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
    ]);
    expect(parsed.snapshot.list[0]?.id).not.toBe(custom.list[0]?.id);
  });
});
