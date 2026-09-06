import { describe, expect, it } from "vitest";

import { executeOperation } from "@/lib/python/operations";
import {
  createList,
  pythonNumber,
  pythonString,
} from "@/lib/python/values";

import {
  buildOperationSteps,
  cellVisualStateAt,
  isStepModeMethod,
} from "./steps";

const fruits = () =>
  createList([
    pythonString("apple"),
    pythonString("banana"),
    pythonString("orange"),
  ]);

describe("isStepModeMethod", () => {
  it("supports instructional methods only", () => {
    expect(isStepModeMethod("len")).toBe(true);
    expect(isStepModeMethod("append")).toBe(false);
    expect(isStepModeMethod("copy")).toBe(false);
  });
});

describe("buildOperationSteps", () => {
  it("returns no steps for unsupported methods", () => {
    const result = executeOperation({
      method: "append",
      list: fruits(),
      variableName: "fruits",
      args: { value: pythonString("mango") },
    });
    expect(buildOperationSteps({ result, method: "append" })).toEqual([]);
  });

  it("builds a scan plus conclusion for len", () => {
    const result = executeOperation({
      method: "len",
      list: fruits(),
      variableName: "fruits",
    });
    const steps = buildOperationSteps({ result, method: "len" });
    expect(steps).toHaveLength(4);
    expect(steps[0]?.scanCount).toBe(1);
    expect(steps[2]?.activeIndices).toEqual([2]);
    expect(steps[3]?.id).toBe("result");
    expect(steps[3]?.explanation).toContain("3 items");
  });

  it("counts matches as it scans", () => {
    const result = executeOperation({
      method: "count",
      list: createList([
        pythonString("A"),
        pythonString("B"),
        pythonString("A"),
      ]),
      variableName: "letters",
      args: { value: pythonString("A") },
    });
    const steps = buildOperationSteps({ result, method: "count" });
    expect(steps[0]?.scanCount).toBe(1);
    expect(steps[1]?.scanCount).toBe(1);
    expect(steps[2]?.scanCount).toBe(2);
    expect(steps.at(-1)?.id).toBe("result");
  });

  it("stops index() at the first match and supports a miss", () => {
    const hit = executeOperation({
      method: "index",
      list: fruits(),
      variableName: "fruits",
      args: { value: pythonString("banana") },
    });
    const hitSteps = buildOperationSteps({ result: hit, method: "index" });
    expect(hitSteps[0]?.matchedIndices).toEqual([]);
    expect(hitSteps[1]?.matchedIndices).toEqual([1]);
    expect(hitSteps.at(-1)?.id).toBe("result");

    const miss = executeOperation({
      method: "index",
      list: fruits(),
      variableName: "fruits",
      args: { value: pythonString("kiwi") },
    });
    const missSteps = buildOperationSteps({ result: miss, method: "index" });
    expect(missSteps.at(-1)?.error).toBe(true);
    expect(missSteps.at(-1)?.label).toBe("ValueError");
  });

  it("previews insert before committing the after list", () => {
    const result = executeOperation({
      method: "insert",
      list: fruits(),
      variableName: "fruits",
      args: { index: 1, value: pythonString("kiwi") },
    });
    const steps = buildOperationSteps({ result, method: "insert" });
    expect(steps).toHaveLength(2);
    expect(steps[0]?.statePreview).toHaveLength(3);
    expect(steps[1]?.statePreview).toHaveLength(4);
    expect(cellVisualStateAt(steps[0]!, 1)).toBe("active-index");
    expect(cellVisualStateAt(steps[1]!, 1)).toBe("inserted");
  });

  it("scans then removes the first match, and reports a miss", () => {
    const result = executeOperation({
      method: "remove",
      list: createList([
        pythonString("apple"),
        pythonString("banana"),
        pythonString("apple"),
      ]),
      variableName: "fruit",
      args: { value: pythonString("apple") },
    });
    const steps = buildOperationSteps({ result, method: "remove" });
    expect(steps[0]?.statePreview).toHaveLength(3);
    expect(steps.at(-1)?.statePreview).toHaveLength(2);
    expect(steps.at(-1)?.id).toBe("remove");

    const miss = executeOperation({
      method: "remove",
      list: fruits(),
      variableName: "fruits",
      args: { value: pythonString("kiwi") },
    });
    const missSteps = buildOperationSteps({ result: miss, method: "remove" });
    expect(missSteps.at(-1)?.error).toBe(true);
  });

  it("highlights the pop index then shows the after list", () => {
    const result = executeOperation({
      method: "pop",
      list: fruits(),
      variableName: "fruits",
    });
    const steps = buildOperationSteps({ result, method: "pop" });
    expect(steps).toHaveLength(2);
    expect(steps[0]?.activeIndices).toEqual([2]);
    expect(steps[1]?.statePreview).toHaveLength(2);
  });

  it("keeps sort illustrative with a before and after step", () => {
    const result = executeOperation({
      method: "sort",
      list: createList([
        pythonNumber(8),
        pythonNumber(3),
        pythonNumber(1),
      ]),
      variableName: "numbers",
    });
    const steps = buildOperationSteps({ result, method: "sort" });
    expect(steps).toHaveLength(2);
    expect(steps[0]?.disclaimer).toBeTruthy();
    expect(steps[1]?.statePreview?.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(3),
      pythonNumber(8),
    ]);
  });

  it("shows sorted() as a secondary list without mutating the original preview", () => {
    const result = executeOperation({
      method: "sorted",
      list: createList([pythonNumber(2), pythonNumber(1)]),
      variableName: "numbers",
    });
    const steps = buildOperationSteps({ result, method: "sorted" });
    expect(steps[1]?.statePreview?.map((item) => item.value)).toEqual([
      pythonNumber(2),
      pythonNumber(1),
    ]);
    expect(steps[1]?.secondaryPreview?.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
    ]);
  });
});
