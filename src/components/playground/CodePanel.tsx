"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildPlaygroundSource } from "@/lib/playground/display";
import { usePlaygroundStore } from "@/store/playground-store";

export function CodePanel() {
  const [copied, setCopied] = useState(false);
  const variableName = usePlaygroundStore((state) => state.variableName);
  const list = usePlaygroundStore((state) => state.list);
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const operationArguments = usePlaygroundStore((state) => state.arguments);

  const source = buildPlaygroundSource({
    variableName,
    list,
    method: selectedMethod,
    arguments: operationArguments,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      toast.success("Python code copied.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy the Python code.");
    }
  }

  return (
    <section
      aria-labelledby="code-panel-heading"
      className="flex min-h-64 flex-col rounded-xl border border-border bg-code text-code-foreground"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 id="code-panel-heading" className="text-sm font-medium">
          Python
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon data-icon="inline-start" />
          ) : (
            <CopyIcon data-icon="inline-start" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="flex-1 overflow-x-auto p-4 font-mono text-sm leading-7">
        <code>{source}</code>
      </pre>
    </section>
  );
}
