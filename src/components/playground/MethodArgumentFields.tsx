"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ValueField } from "@/components/playground/ValueField";
import { getMethod } from "@/data/methods";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/store/playground-store";

export function MethodArgumentFields({
  layout = "panel",
}: {
  layout?: "panel" | "strip";
}) {
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const operationArguments = usePlaygroundStore((state) => state.arguments);
  const setValueDraft = usePlaygroundStore((state) => state.setValueDraft);
  const setIndexText = usePlaygroundStore((state) => state.setIndexText);
  const setReverse = usePlaygroundStore((state) => state.setReverse);
  const updateValueDraftAt = usePlaygroundStore(
    (state) => state.updateValueDraftAt,
  );
  const addExtendValue = usePlaygroundStore((state) => state.addExtendValue);
  const removeExtendValue = usePlaygroundStore(
    (state) => state.removeExtendValue,
  );
  const method = getMethod(selectedMethod);
  const strip = layout === "strip";

  if (method.argumentSchema.length === 0) {
    return strip ? null : (
      <p className="text-sm text-muted-foreground">No arguments needed.</p>
    );
  }

  return (
    <FieldGroup className={cn(strip && "flex-row flex-wrap items-end gap-3")}>
      {method.argumentSchema.map((argument) => {
        if (argument.kind === "value") {
          return (
            <ValueField
              key={argument.name}
              id="operation-value"
              label={argument.label}
              description={strip ? undefined : argument.description}
              value={operationArguments.value}
              onChange={setValueDraft}
              compact={strip}
            />
          );
        }

        if (argument.kind === "index") {
          return (
            <Field key={argument.name} className={cn(strip && "min-w-28")}>
              <FieldLabel htmlFor="operation-index">{argument.label}</FieldLabel>
              <Input
                id="operation-index"
                name="index"
                inputMode="numeric"
                value={operationArguments.indexText}
                placeholder={argument.required ? "0" : "Last item"}
                onChange={(event) => setIndexText(event.target.value)}
                className="min-h-11 font-mono"
              />
              {strip ? null : (
                <FieldDescription>{argument.description}</FieldDescription>
              )}
            </Field>
          );
        }

        if (argument.kind === "boolean") {
          return (
            <Field key={argument.name}>
              <FieldLabel id="sort-order-label">Order</FieldLabel>
              <ToggleGroup
                value={[operationArguments.reverse ? "desc" : "asc"]}
                onValueChange={(next) => {
                  if (next[0] === "desc") {
                    setReverse(true);
                  }
                  if (next[0] === "asc") {
                    setReverse(false);
                  }
                }}
                aria-labelledby="sort-order-label"
                className="min-h-11"
              >
                <ToggleGroupItem value="asc" className="min-h-11 px-3">
                  Ascending
                </ToggleGroupItem>
                <ToggleGroupItem value="desc" className="min-h-11 px-3">
                  Descending
                </ToggleGroupItem>
              </ToggleGroup>
              {strip ? null : (
                <FieldDescription>{argument.description}</FieldDescription>
              )}
            </Field>
          );
        }

        return (
          <Field key={argument.name} className={cn(strip && "w-full")}>
            <FieldLabel>{argument.label}</FieldLabel>
            <div className="flex flex-col gap-3">
              {operationArguments.values.map((draft, index) => (
                <div
                  key={`extend-${index}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <ValueField
                    id={`extend-value-${index}`}
                    label={`Item ${index}`}
                    value={draft}
                    onChange={(next) => updateValueDraftAt(index, next)}
                    compact
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 self-start"
                    onClick={() => removeExtendValue(index)}
                    aria-label={`Remove item ${index}`}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="min-h-11 self-start"
                onClick={addExtendValue}
              >
                <PlusIcon data-icon="inline-start" />
                Add item
              </Button>
            </div>
            {strip ? null : (
              <FieldDescription>{argument.description}</FieldDescription>
            )}
          </Field>
        );
      })}
    </FieldGroup>
  );
}
