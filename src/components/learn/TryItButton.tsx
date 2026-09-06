"use client";

import { Button } from "@/components/ui/button";
import { getMethod, type MethodTryIt } from "@/data/methods";
import { prefersReducedMotion } from "@/lib/animations/reduced-motion";
import type { MethodId } from "@/lib/python/types";
import { usePlaygroundStore } from "@/store/playground-store";

export function focusPlayground() {
  const playground = document.getElementById("playground");
  if (!(playground instanceof HTMLElement)) {
    return;
  }

  playground.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  playground.focus({ preventScroll: true });
}

export function TryItButton({
  method,
  snapshot,
  children = "Try it",
}: {
  method: MethodId;
  snapshot?: MethodTryIt;
  children?: string;
}) {
  const tryMethod = usePlaygroundStore((state) => state.tryMethod);
  const methodLabel = getMethod(method).label;

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 px-3"
      aria-label={`Try ${methodLabel} in the playground`}
      onClick={() => {
        tryMethod(method, snapshot);
        focusPlayground();
      }}
    >
      {children}
    </Button>
  );
}
