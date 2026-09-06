import type { Metadata } from "next";

import { Playground } from "@/components/playground/Playground";

export const metadata: Metadata = {
  title: "Playground — Python Lists Playground",
  description:
    "Open a shareable Python list playground. Choose a method, edit the list, and watch the operation happen visually.",
};

export default function PlaygroundPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Playground />
    </main>
  );
}
