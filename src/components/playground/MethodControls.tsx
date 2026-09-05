"use client";

import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEMO_APPEND_VALUE } from "@/data/playground-demo";

export function MethodControls() {
  return (
    <section
      aria-labelledby="method-controls-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
    >
      <h3 id="method-controls-heading" className="text-sm font-medium">
        Operation
      </h3>

      <p className="font-mono text-sm">append()</p>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="append-value">Value</FieldLabel>
          <Input
            id="append-value"
            name="value"
            defaultValue={DEMO_APPEND_VALUE}
            readOnly
            className="min-h-11 font-mono"
          />
          <FieldDescription>
            Adds this item to the end of the list.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </section>
  );
}

export function RunAppendButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type="button" className="min-h-11 w-full" aria-disabled="true" />
        }
      >
        <PlayIcon data-icon="inline-start" />
        Run append()
      </TooltipTrigger>
      <TooltipContent>Available in a later phase</TooltipContent>
    </Tooltip>
  );
}
