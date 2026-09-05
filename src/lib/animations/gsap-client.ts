"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

let registered = false;

export function registerGsapPlugins(): void {
  if (registered || typeof window === "undefined") {
    return;
  }

  gsap.registerPlugin(useGSAP, Flip);
  registered = true;
}

export { Flip, gsap, useGSAP };
