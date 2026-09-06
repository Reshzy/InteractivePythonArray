"use client";

import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHODS, getMethod, isMethodId } from "@/data/methods";
import { isPresetId, presetSelectState } from "@/data/presets";
import { isRunLocked } from "@/lib/animations/playback";
import { usePlaygroundStore } from "@/store/playground-store";

import { MethodArgumentFields } from "./MethodArgumentFields";

const METHOD_ITEMS = METHODS.map((method) => ({
  value: method.id,
  label: method.label,
}));

export function InstrumentStrip() {
  const selectedPreset = usePlaygroundStore((state) => state.selectedPreset);
  const presetSource = usePlaygroundStore((state) => state.presetSource);
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
  const preset = presetSelectState(selectedPreset, presetSource);

  return (
    <div
      data-instrument-strip
      className="flex flex-col gap-3"
    >
      <div className="flex items-end gap-3">
        <Field className="min-w-0 flex-1 gap-1">
          <FieldLabel htmlFor="list-method">Method</FieldLabel>
          <Select
            items={METHOD_ITEMS}
            value={selectedMethod}
            onValueChange={(value) => {
              if (isMethodId(value)) {
                setSelectedMethod(value);
              }
            }}
          >
            <SelectTrigger id="list-method" className="min-h-11 w-full font-mono">
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
        </Field>

        <div className="flex shrink-0 flex-col items-stretch gap-1">
          <Button
            type="button"
            className="min-h-12 min-w-24 px-5 text-base shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)] sm:min-w-28 sm:px-6"
            onClick={execute}
            disabled={runLocked}
          >
            <PlayIcon data-icon="inline-start" />
            Run
            <span className="sr-only">{` ${method.label}`}</span>
          </Button>
          <p className="hidden text-center text-xs text-muted-foreground md:block">
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
              Ctrl
            </kbd>
            {" / "}
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
              Cmd
            </kbd>
            {" + "}
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
              Enter
            </kbd>
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <MethodArgumentFields layout="strip" />

        <Field className="gap-1 sm:max-w-48">
          <FieldLabel htmlFor="list-preset">Preset</FieldLabel>
          <Select
            items={preset.items}
            value={preset.value}
            onValueChange={(value) => {
              if (isPresetId(value)) {
                loadPreset(value);
              }
            }}
          >
            <SelectTrigger id="list-preset" className="min-h-11 min-w-32">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {preset.items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}
