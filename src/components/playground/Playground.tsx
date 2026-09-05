"use client";

import { useEffect, useRef } from "react";

import {
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";
import { usePlaygroundStore } from "@/store/playground-store";

import { CodePanel } from "./CodePanel";
import { HistoryPanel } from "./HistoryPanel";
import { ListVisualizer } from "./ListVisualizer";
import { MethodControls } from "./MethodControls";
import { MethodNavigation } from "./MethodNavigation";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { ResultPanel } from "./ResultPanel";

registerGsapPlugins();

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest("input, textarea, select, [contenteditable=true]") !== null
  );
}

export function Playground() {
  const playgroundRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
        usePlaygroundStore.getState().executeOperation();
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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-playground-shell]", {
          y: 16,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
        });

        gsap.from("[data-list-cell]", {
          y: 10,
          autoAlpha: 0,
          scale: 0.92,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.07,
          delay: 0.12,
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: playgroundRef }
  );

  return (
    <section
      ref={playgroundRef}
      id="playground"
      aria-labelledby="playground-heading"
      className="scroll-mt-20 px-4 py-6 md:py-10"
    >
      <div
        data-playground-shell
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6"
      >
        <PlaygroundToolbar />

        <ListVisualizer />

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <MethodNavigation />
            <MethodControls />
            <ResultPanel />
            <HistoryPanel />
          </div>
          <div className="order-last lg:order-first">
            <CodePanel />
          </div>
        </div>
      </div>
    </section>
  );
}
