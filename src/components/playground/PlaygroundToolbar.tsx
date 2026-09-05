"use client";

import { Redo2Icon, RotateCcwIcon, Undo2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ANIMATION_SPEED_OPTIONS,
  isAnimationSpeed,
} from "@/data/playground-demo";
import { PRESET_SELECT_ITEMS, isPresetId } from "@/data/presets";
import {
  canRedo,
  canUndo,
  usePlaygroundStore,
} from "@/store/playground-store";

export function PlaygroundToolbar() {
  const selectedPreset = usePlaygroundStore((state) => state.selectedPreset);
  const animationSpeed = usePlaygroundStore((state) => state.animationSpeed);
  const history = usePlaygroundStore((state) => state.history);
  const historyIndex = usePlaygroundStore((state) => state.historyIndex);
  const loadPreset = usePlaygroundStore((state) => state.loadPreset);
  const undo = usePlaygroundStore((state) => state.undo);
  const redo = usePlaygroundStore((state) => state.redo);
  const reset = usePlaygroundStore((state) => state.reset);
  const setAnimationSpeed = usePlaygroundStore(
    (state) => state.setAnimationSpeed,
  );

  const undoEnabled = canUndo({ historyIndex });
  const redoEnabled = canRedo({ history, historyIndex });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2
        id="playground-heading"
        className="text-xl font-medium tracking-tight"
      >
        Python List Playground
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={PRESET_SELECT_ITEMS}
          value={selectedPreset}
          onValueChange={(value) => {
            if (isPresetId(value)) {
              loadPreset(value);
            }
          }}
        >
          <SelectTrigger
            aria-label="List preset"
            className="min-h-11 min-w-36"
          >
            <SelectValue placeholder="Preset" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {PRESET_SELECT_ITEMS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={undo}
          disabled={!undoEnabled}
          aria-label="Undo"
        >
          <Undo2Icon data-icon="inline-start" />
          Undo
        </Button>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={redo}
          disabled={!redoEnabled}
          aria-label="Redo"
        >
          <Redo2Icon data-icon="inline-start" />
          Redo
        </Button>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={reset}
          aria-label="Reset playground"
        >
          <RotateCcwIcon data-icon="inline-start" />
          Reset
        </Button>

        <ToggleGroup
          value={[String(animationSpeed)]}
          onValueChange={(next) => {
            const selected = Number(next[0]);
            if (isAnimationSpeed(selected)) {
              setAnimationSpeed(selected);
            }
          }}
          className="min-h-11"
          aria-label="Animation speed"
        >
          {ANIMATION_SPEED_OPTIONS.map((speed) => (
            <ToggleGroupItem
              key={speed.value}
              value={String(speed.value)}
              className="min-h-11 min-w-11 px-2.5 font-mono text-xs"
            >
              {speed.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
