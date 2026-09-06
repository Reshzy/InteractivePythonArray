"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PYTHON_VALUE_TYPE_OPTIONS,
  coerceDraftType,
  type PythonValueType,
  type ValueDraft,
} from "@/lib/playground/arguments";
import { cn } from "@/lib/utils";

const TYPE_ITEMS = PYTHON_VALUE_TYPE_OPTIONS.map((option) => ({
  label: option.label,
  value: option.value,
}));

const BOOLEAN_ITEMS = [
  { label: "True", value: "true" },
  { label: "False", value: "false" },
];

type ValueFieldProps = {
  id: string;
  label: string;
  description?: string;
  value: ValueDraft;
  onChange: (value: ValueDraft) => void;
  compact?: boolean;
};

export function ValueField({
  id,
  label,
  description,
  value,
  onChange,
  compact = false,
}: ValueFieldProps) {
  const typeId = `${id}-type`;
  const valueId = `${id}-value`;

  function handleTypeChange(nextType: PythonValueType | null) {
    if (!nextType) {
      return;
    }

    onChange(coerceDraftType(value, nextType));
  }

  return (
    <Field className={cn(compact && "gap-1.5")}>
      <FieldLabel htmlFor={value.type === "none" ? typeId : valueId}>
        {label}
      </FieldLabel>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row",
          compact && "sm:items-center",
        )}
      >
        <Select
          items={TYPE_ITEMS}
          value={value.type}
          onValueChange={(next) => handleTypeChange(next)}
        >
          <SelectTrigger
            id={typeId}
            aria-label={`${label} type`}
            className="min-h-11 min-w-28"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {TYPE_ITEMS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {value.type === "string" || value.type === "number" ? (
          <Input
            id={valueId}
            name={id}
            value={value.text}
            inputMode={value.type === "number" ? "decimal" : "text"}
            onChange={(event) =>
              onChange({ ...value, text: event.target.value })
            }
            className="min-h-11 font-mono"
            aria-describedby={description ? `${id}-description` : undefined}
          />
        ) : null}

        {value.type === "boolean" ? (
          <Select
            items={BOOLEAN_ITEMS}
            value={value.booleanValue ? "true" : "false"}
            onValueChange={(next) => {
              if (next === "true" || next === "false") {
                onChange({ ...value, booleanValue: next === "true" });
              }
            }}
          >
            <SelectTrigger
              id={valueId}
              aria-label={`${label} boolean`}
              className="min-h-11 min-w-28 font-mono"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {BOOLEAN_ITEMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {value.type === "none" ? (
          <p
            id={valueId}
            className="flex min-h-11 items-center font-mono text-sm text-muted-foreground"
          >
            None
          </p>
        ) : null}
      </div>
      {description ? (
        <FieldDescription
          id={`${id}-description`}
          className={cn(compact && "sr-only")}
        >
          {description}
        </FieldDescription>
      ) : null}
    </Field>
  );
}
