"use client";

import { RotateCcwIcon, Undo2Icon } from "lucide-react";

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ANIMATION_SPEEDS,
  DEFAULT_ANIMATION_SPEED,
  PRESET_OPTIONS,
} from "@/data/playground-demo";

const laterPhaseHint = "Available in a later phase";

const presetItems = PRESET_OPTIONS.map((preset) => ({
  label: preset.label,
  value: preset.value,
}));

export function PlaygroundToolbar() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2
        id="playground-heading"
        className="text-xl font-medium tracking-tight"
      >
        Python List Playground
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <Select items={presetItems} defaultValue="fruits" disabled>
          <SelectTrigger
            aria-label="List preset"
            className="min-h-11 min-w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {presetItems.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <DeferredActionButton label="Undo" icon={Undo2Icon} />
        <DeferredActionButton label="Reset" icon={RotateCcwIcon} />

        <ToggleGroup
          defaultValue={[DEFAULT_ANIMATION_SPEED]}
          className="min-h-11"
          aria-label="Animation speed"
        >
          {ANIMATION_SPEEDS.map((speed) => (
            <ToggleGroupItem
              key={speed}
              value={speed}
              className="min-h-11 min-w-11 px-2.5 font-mono text-xs"
            >
              {speed}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

function DeferredActionButton({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Undo2Icon;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            className="min-h-11"
            aria-disabled="true"
          />
        }
      >
        <Icon data-icon="inline-start" />
        {label}
      </TooltipTrigger>
      <TooltipContent>{laterPhaseHint}</TooltipContent>
    </Tooltip>
  );
}
