"use client";

import { useRef } from "react";

import {
  gsap,
  registerGsapPlugins,
  useGSAP,
} from "@/lib/animations/gsap-client";
import { prefersReducedMotion } from "@/lib/animations/reduced-motion";

registerGsapPlugins();

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const signature = footerRef.current?.querySelector(
        "[data-creator-signature]"
      );
      const heart = heartRef.current;

      if (!signature || !heart || !contextSafe) {
        return;
      }

      const handleHeartEnter = contextSafe(() => {
        if (prefersReducedMotion()) {
          return;
        }

        gsap.fromTo(
          heart,
          { scale: 1 },
          {
            scale: 1.15,
            duration: 0.25,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          }
        );
      });

      signature.addEventListener("mouseenter", handleHeartEnter);

      return () => {
        signature.removeEventListener("mouseenter", handleHeartEnter);
      };
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="mt-auto border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
        <p className="text-xs text-muted-foreground">Python Lists Playground</p>
        <p
          data-creator-signature
          className="group cursor-default text-xs text-muted-foreground/60 transition-opacity hover:text-muted-foreground"
        >
          Made by kuya Rodge{" "}
          <span
            ref={heartRef}
            aria-hidden="true"
            className="inline-block transition-colors group-hover:text-primary"
          >
            &lt;3
          </span>
        </p>
      </div>
    </footer>
  );
}
