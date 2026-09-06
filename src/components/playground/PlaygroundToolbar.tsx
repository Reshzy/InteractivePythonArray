"use client";

import {
  Redo2Icon,
  RotateCcwIcon,
  Share2Icon,
  Undo2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getChallenge } from "@/data/challenges";
import {
  ANIMATION_SPEED_OPTIONS,
  isAnimationSpeed,
} from "@/data/playground-demo";
import { buildShareUrl } from "@/lib/playground/share";
import {
  canRedo,
  canUndo,
  usePlaygroundStore,
} from "@/store/playground-store";

const MODE_TOGGLE_CLASS =
  "min-h-11 px-3 aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:text-foreground data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-foreground";

function ToolbarTip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function PlaygroundToolbar({ hasRunOnce }: { hasRunOnce: boolean }) {
  const animationSpeed = usePlaygroundStore((state) => state.animationSpeed);
  const undoEnabled = usePlaygroundStore((state) => canUndo(state));
  const redoEnabled = usePlaygroundStore((state) => canRedo(state));
  const undo = usePlaygroundStore((state) => state.undo);
  const redo = usePlaygroundStore((state) => state.redo);
  const reset = usePlaygroundStore((state) => state.reset);
  const setAnimationSpeed = usePlaygroundStore(
    (state) => state.setAnimationSpeed,
  );
  const activeChallengeId = usePlaygroundStore(
    (state) => state.activeChallengeId,
  );
  const xRayMode = usePlaygroundStore((state) => state.xRayMode);
  const stepMode = usePlaygroundStore((state) => state.stepMode);
  const setXRayMode = usePlaygroundStore((state) => state.setXRayMode);
  const setStepMode = usePlaygroundStore((state) => state.setStepMode);
  const selectedPreset = usePlaygroundStore((state) => state.selectedPreset);
  const [shareMessage, setShareMessage] = useState("");

  const activeChallenge = activeChallengeId
    ? getChallenge(activeChallengeId)
    : null;
  const undoLabel = undoEnabled ? "Undo" : "Nothing to undo";
  const redoLabel = redoEnabled ? "Redo" : "Nothing to redo";

  async function handleShare() {
    const state = usePlaygroundStore.getState();
    const url = buildShareUrl(state, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Playground link copied.");
      setShareMessage("Playground link copied.");
    } catch {
      toast.error("Could not copy the playground link.");
      setShareMessage("Could not copy the playground link.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {activeChallenge ? (
        <Link
          href="/#challenges"
          className="inline-flex w-fit min-h-11 items-center gap-2 rounded-lg"
          aria-label={`Practice challenge: ${activeChallenge.title}. Back to challenges.`}
        >
          <Badge>Practice</Badge>
          <span className="truncate text-sm text-muted-foreground">
            {activeChallenge.title}
          </span>
        </Link>
      ) : null}

      {!hasRunOnce && selectedPreset === null ? (
        <ToolbarTip label="Reset playground">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={reset}
            aria-label="Reset playground"
            title="Reset playground"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </ToolbarTip>
      ) : null}

      {hasRunOnce ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarTip label={xRayMode ? "Hide X-Ray" : "Show X-Ray"}>
              <Toggle
                variant="outline"
                pressed={xRayMode}
                onPressedChange={setXRayMode}
                className={MODE_TOGGLE_CLASS}
                aria-label="X-Ray mode"
              >
                X-Ray
              </Toggle>
            </ToolbarTip>

            <ToolbarTip label={stepMode ? "Turn off Step mode" : "Turn on Step mode"}>
              <Toggle
                variant="outline"
                pressed={stepMode}
                onPressedChange={setStepMode}
                className={MODE_TOGGLE_CLASS}
                aria-label="Step mode"
              >
                Step
              </Toggle>
            </ToolbarTip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolbarTip label={undoLabel}>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={undo}
                disabled={!undoEnabled}
                aria-label="Undo"
                title={undoLabel}
              >
                <Undo2Icon data-icon="inline-start" />
                Undo
              </Button>
            </ToolbarTip>

            <ToolbarTip label={redoLabel}>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={redo}
                disabled={!redoEnabled}
                aria-label="Redo"
                title={redoLabel}
              >
                <Redo2Icon data-icon="inline-start" />
                Redo
              </Button>
            </ToolbarTip>

            <ToolbarTip label="Copy a shareable playground link">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  void handleShare();
                }}
                aria-label="Share playground"
              >
                <Share2Icon data-icon="inline-start" />
                Share
              </Button>
            </ToolbarTip>

            <ToolbarTip label="Reset playground">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={reset}
                aria-label="Reset playground"
                title="Reset playground"
              >
                <RotateCcwIcon data-icon="inline-start" />
                Reset
              </Button>
            </ToolbarTip>

            <ToggleGroup
              value={[String(animationSpeed)]}
              onValueChange={(next) => {
                const selected = Number(next[0]);
                if (isAnimationSpeed(selected)) {
                  setAnimationSpeed(selected);
                }
              }}
              className="min-h-11 flex-wrap"
              aria-label="Animation speed"
            >
              {ANIMATION_SPEED_OPTIONS.map((speed) => (
                <ToggleGroupItem
                  key={speed.value}
                  value={String(speed.value)}
                  className="min-h-11 min-w-11 px-2.5 font-mono text-xs data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-foreground"
                >
                  {speed.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {shareMessage}
      </p>
    </div>
  );
}
