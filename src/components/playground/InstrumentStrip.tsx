"use client";

import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHODS, getMethod, isMethodId } from "@/data/methods";
import { PRESET_SELECT_ITEMS, isPresetId } from "@/data/presets";
import { isRunLocked } from "@/lib/animations/playback";
import { usePlaygroundStore } from "@/store/playground-store";

import { MethodArgumentFields } from "./MethodArgumentFields";

const METHOD_ITEMS = METHODS.map((method) => ({
  value: method.id,
  label: method.label,
}));

export function InstrumentStrip() {
  const selectedPreset = usePlaygroundStore((state) => state.selectedPreset);
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const loadPreset = usePlaygroundStore((state) => state.loadPreset);
  const setSelectedMethod = usePlaygroundStore(
    (state) => state.setSelectedMethod,
  );
  const execute = usePlaygroundStore((state) => state.executeOperation);
  const isAnimating = usePlaygroundStore((state) => state.isAnimating);
  const playbackKind = usePlaygroundStore((state) => state.playbackKind);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const runLocked = isRunLocked({ isAnimating, playbackKind, lastResult });
  const method = getMethod(selectedMethod);

  return (
    <div
      data-instrument-strip
      className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <Select
        items={PRESET_SELECT_ITEMS}
        value={selectedPreset}
        onValueChange={(value) => {
          if (isPresetId(value)) {
            loadPreset(value);
          }
        }}
      >
        <SelectTrigger aria-label="List preset" className="min-h-11 min-w-32">
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

      <Select
        items={METHOD_ITEMS}
        value={selectedMethod}
        onValueChange={(value) => {
          if (isMethodId(value)) {
            setSelectedMethod(value);
          }
        }}
      >
        <SelectTrigger aria-label="List method" className="min-h-11 min-w-36 font-mono">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {METHOD_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <MethodArgumentFields layout="strip" />
      </div>

      <Button
        type="button"
        className="min-h-12 min-w-28 px-6 text-base shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
        onClick={execute}
        disabled={runLocked}
      >
        <PlayIcon data-icon="inline-start" />
        Run
        <span className="sr-only">{` ${method.label}`}</span>
      </Button>
    </div>
  );
}
