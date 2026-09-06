"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { prefersReducedMotion } from "@/lib/animations/reduced-motion";
import { stepAutoplayDelayMs } from "@/lib/animations/timing";
import {
  canStepBack,
  canStepForward,
  usePlaygroundStore,
} from "@/store/playground-store";

export function StepControls() {
  const playbackKind = usePlaygroundStore((state) => state.playbackKind);
  const steps = usePlaygroundStore((state) => state.steps);
  const stepIndex = usePlaygroundStore((state) => state.stepIndex);
  const stepPlaying = usePlaygroundStore((state) => state.stepPlaying);
  const animationSpeed = usePlaygroundStore((state) => state.animationSpeed);
  const stepBack = usePlaygroundStore((state) => state.stepBack);
  const stepForward = usePlaygroundStore((state) => state.stepForward);
  const setStepPlaying = usePlaygroundStore((state) => state.setStepPlaying);

  useEffect(() => {
    if (!stepPlaying || playbackKind !== "step") {
      return;
    }

    const delay = stepAutoplayDelayMs(
      animationSpeed,
      prefersReducedMotion(),
    );
    const timer = window.setTimeout(() => {
      usePlaygroundStore.getState().stepForward();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [stepPlaying, playbackKind, stepIndex, animationSpeed]);

  if (playbackKind !== "step" || steps.length === 0) {
    return null;
  }

  const total = steps.length;
  const current = stepIndex + 1;
  const backEnabled = canStepBack({ playbackKind, stepIndex });
  const forwardEnabled = canStepForward({ playbackKind, steps });

  return (
    <div
      data-step-controls
      className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
    >
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => {
              setStepPlaying(false);
              stepBack();
            }}
            disabled={!backEnabled}
            aria-label="Back to previous step"
            title={backEnabled ? "Previous step" : "Already at the first step"}
          >
            Back
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {backEnabled ? "Previous step" : "Already at the first step"}
        </TooltipContent>
      </Tooltip>

      <p className="font-mono text-sm text-muted-foreground" aria-live="polite">
        Step {current} of {total}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setStepPlaying(!stepPlaying)}
          aria-label={stepPlaying ? "Pause steps" : "Play remaining steps"}
        >
          {stepPlaying ? "Pause" : "Play"}
        </Button>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => {
                setStepPlaying(false);
                stepForward();
              }}
              disabled={!forwardEnabled}
              aria-label="Next step"
              title={forwardEnabled ? "Next step" : "Already at the last step"}
            >
              Next
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {forwardEnabled ? "Next step" : "Already at the last step"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
