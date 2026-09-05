"use client";

import { PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
import { usePlaygroundStore } from "@/store/playground-store";

export function MethodControls() {
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
  const execute = usePlaygroundStore((state) => state.executeOperation);

  const method = getMethod(selectedMethod);

  return (
    <section
      aria-labelledby="method-controls-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
    >
      <h3 id="method-controls-heading" className="text-sm font-medium">
        Operation
      </h3>

      <p className="font-mono text-sm">{method.label}</p>
      <p className="text-sm text-muted-foreground">{method.shortDescription}</p>

      {method.argumentSchema.length > 0 ? (
        <FieldGroup>
          {method.argumentSchema.map((argument) => {
            if (argument.kind === "value") {
              return (
                <ValueField
                  key={argument.name}
                  id="operation-value"
                  label={argument.label}
                  description={argument.description}
                  value={operationArguments.value}
                  onChange={setValueDraft}
                />
              );
            }

            if (argument.kind === "index") {
              return (
                <Field key={argument.name}>
                  <FieldLabel htmlFor="operation-index">
                    {argument.label}
                  </FieldLabel>
                  <Input
                    id="operation-index"
                    name="index"
                    inputMode="numeric"
                    value={operationArguments.indexText}
                    placeholder={argument.required ? "0" : "Last item"}
                    onChange={(event) => setIndexText(event.target.value)}
                    className="min-h-11 font-mono"
                  />
                  <FieldDescription>{argument.description}</FieldDescription>
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
                  <FieldDescription>{argument.description}</FieldDescription>
                </Field>
              );
            }

            return (
              <Field key={argument.name}>
                <FieldLabel>{argument.label}</FieldLabel>
                <div className="flex flex-col gap-3">
                  {operationArguments.values.map((draft, index) => (
                    <div
                      key={`extend-${index}`}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3"
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
                    className="min-h-11"
                    onClick={addExtendValue}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add item
                  </Button>
                </div>
                <FieldDescription>{argument.description}</FieldDescription>
              </Field>
            );
          })}
        </FieldGroup>
      ) : (
        <p className="text-sm text-muted-foreground">No arguments needed.</p>
      )}

      <Button
        type="button"
        className="min-h-11 w-full"
        onClick={execute}
      >
        <PlayIcon data-icon="inline-start" />
        Run {method.label}
      </Button>
    </section>
  );
}
