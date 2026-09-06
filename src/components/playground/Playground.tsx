"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { registerGsapPlugins } from "@/lib/animations/gsap-client";
import { parseShareSearchParams } from "@/lib/playground/share";
import { isRunLocked } from "@/lib/animations/playback";
import { usePlaygroundStore } from "@/store/playground-store";

import { HistoryPanel } from "./HistoryPanel";
import { InstrumentStrip } from "./InstrumentStrip";
import { ListVisualizer } from "./ListVisualizer";
import { OperationCaption } from "./OperationCaption";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { ResultPanel } from "./ResultPanel";
import { StepControls } from "./StepControls";
import { useListPlayback } from "./use-list-playback";

registerGsapPlugins();

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest("input, textarea, select, [contenteditable=true]") !== null
  );
}

export function Playground({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const HeadingTag = headingLevel;
  const playgroundRef = useRef<HTMLElement>(null);
  const playback = useListPlayback(playgroundRef);
  const hasHydrated = usePlaygroundStore((state) => state.hasHydrated);
  const lastResult = usePlaygroundStore((state) => state.lastResult);
  const history = usePlaygroundStore((state) => state.history);
  const nestedHeading = headingLevel === "h1" ? "h2" : "h3";
  const hasRunOnce = lastResult !== null || history.length > 0;

  useEffect(() => {
    const parsed = parseShareSearchParams(
      new URLSearchParams(window.location.search),
    );
    if (parsed.ok) {
      usePlaygroundStore.getState().loadSharedState(parsed.snapshot);
      usePlaygroundStore.getState().setHasHydrated(true);
      return;
    }

    if (parsed.reason === "invalid") {
      toast.error("Couldn't load that shared playground.");
    }

    void Promise.resolve(usePlaygroundStore.persist.rehydrate()).finally(() => {
      usePlaygroundStore.getState().setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (!isMod) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const state = usePlaygroundStore.getState();
        if (state.hasHydrated && !isRunLocked(state)) {
          state.executeOperation();
        }
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "z" && event.shiftKey) {
        event.preventDefault();
        usePlaygroundStore.getState().redo();
        return;
      }

      if (event.key === "y") {
        event.preventDefault();
        usePlaygroundStore.getState().redo();
        return;
      }

      if (event.key === "z") {
        event.preventDefault();
        usePlaygroundStore.getState().undo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section
      ref={playgroundRef}
      id="playground"
      tabIndex={-1}
      aria-labelledby="playground-heading"
      className="scroll-mt-22 flex flex-col px-4 pt-3 pb-8 outline-none"
      aria-busy={!hasHydrated}
    >
      <div
        data-playground-shell
        className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      >
        <header className="flex max-w-[65ch] flex-col gap-1">
          <HeadingTag
            id="playground-heading"
            className="text-xl font-medium tracking-tight md:text-2xl"
          >
            Playground
          </HeadingTag>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Learn Python lists by playing with them.
          </p>
        </header>
        {!hasHydrated ? (
          <p className="sr-only">Loading saved playground</p>
        ) : null}
        <div className="flex flex-col gap-6" inert={!hasHydrated || undefined}>
          <div className="flex flex-col gap-3">
            <ListVisualizer
              displayList={playback.displayList}
              incoming={playback.incoming}
              secondary={playback.secondary}
              secondaryLabels={playback.secondaryLabels}
              scanCount={playback.scanCount}
              disclaimer={playback.disclaimer}
              visualizerError={playback.visualizerError}
              interactive={playback.interactive && hasHydrated}
              cellStates={playback.cellStates}
            />

            <InstrumentStrip />
            <OperationCaption />
            {hasRunOnce ? <ResultPanel headingLevel={nestedHeading} /> : null}
          </div>
          <StepControls />
          <PlaygroundToolbar hasRunOnce={hasRunOnce} />
          {hasRunOnce ? <HistoryPanel headingLevel={nestedHeading} /> : null}
        </div>
      </div>
    </section>
  );
}
