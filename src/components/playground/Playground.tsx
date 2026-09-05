"use client";

import { useRef } from "react";

import {
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";
import {
  DEMO_LIST_VALUES,
  DEMO_VARIABLE_NAME,
} from "@/data/playground-demo";

import { CodePanel } from "./CodePanel";
import { ListVisualizer } from "./ListVisualizer";
import { MethodControls, RunAppendButton } from "./MethodControls";
import { MethodNavigation } from "./MethodNavigation";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { ResultPanel } from "./ResultPanel";

registerGsapPlugins();

export function Playground() {
  const playgroundRef = useRef<HTMLElement>(null);

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

        <ListVisualizer
          variableName={DEMO_VARIABLE_NAME}
          values={DEMO_LIST_VALUES}
        />

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <MethodNavigation />
            <MethodControls />
            <RunAppendButton />
            <ResultPanel />
          </div>
          <div className="order-last lg:order-first">
            <CodePanel />
          </div>
        </div>
      </div>
    </section>
  );
}
