"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";

registerGsapPlugins();

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-copy]", {
          y: 12,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.06,
        });

        gsap.from("[data-hero-cell]", {
          y: 8,
          autoAlpha: 0,
          scale: 0.92,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.15,
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14"
    >
      <div className="max-w-2xl">
        <h1
          data-hero-copy
          className="text-3xl font-medium tracking-tight text-balance sm:text-4xl"
        >
          Learn Python lists by playing with them.
        </h1>
        <p
          data-hero-copy
          className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty"
        >
          Add, remove, search, sort, and rearrange list items while watching
          every Python operation happen visually. In beginner Python, what people
          often call an “array” is usually a{" "}
          <span className="font-medium text-foreground">list</span>.
        </p>
        <div data-hero-copy className="mt-6 flex flex-wrap gap-3">
          <Button
            render={<a href="#playground" />}
            nativeButton={false}
            className="min-h-11 px-4"
          >
            Start Playing
          </Button>
          <Button
            render={<a href="#methods" />}
            nativeButton={false}
            variant="outline"
            className="min-h-11 px-4"
          >
            Explore Methods
          </Button>
        </div>
      </div>

      <div
        data-hero-copy
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
        aria-label="Example of appending a value to a Python list"
      >
        <pre className="overflow-x-auto font-mono text-xs text-muted-foreground">
          <code>{`items = ["Python", "Lists"]
items.append("fun")`}</code>
        </pre>
        <div className="flex flex-wrap items-center gap-2">
          <HeroCell value="Python" />
          <HeroCell value="Lists" />
          <span className="px-1 font-mono text-xs text-muted-foreground" aria-hidden="true">
            →
          </span>
          <span className="sr-only">becomes</span>
          <HeroCell value="Python" />
          <HeroCell value="Lists" />
          <HeroCell value="fun" highlighted />
        </div>
      </div>
    </section>
  );
}

function HeroCell({
  value,
  highlighted = false,
}: {
  value: string;
  highlighted?: boolean;
}) {
  return (
    <span
      data-hero-cell
      className={
        highlighted
          ? "rounded-md border border-primary/40 bg-secondary px-2.5 py-1 font-mono text-xs text-foreground"
          : "rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs text-foreground"
      }
    >
      &quot;{value}&quot;
    </span>
  );
}
