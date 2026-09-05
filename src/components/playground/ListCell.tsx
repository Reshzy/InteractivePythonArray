"use client";

import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ValueField } from "@/components/playground/ValueField";
import {
  isPlaygroundError,
  parseValueDraft,
  valueToDraft,
  type ValueDraft,
} from "@/lib/playground/arguments";
import { formatPythonValue } from "@/lib/python/format";
import type { ListItem, PythonValue } from "@/lib/python/types";
import { cn } from "@/lib/utils";

type ListCellProps = {
  item: ListItem;
  index: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (value: PythonValue) => void;
  onDelete: () => void;
  className?: string;
};

export function ListCell({
  item,
  index,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  className,
}: ListCellProps) {
  return (
    <div
      data-list-cell
      className={cn(
        "flex min-w-28 shrink-0 flex-col items-center gap-1.5",
        isEditing && "min-w-56",
        className,
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
      {isEditing ? (
        <ListCellEditor
          item={item}
          index={index}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
        />
      ) : (
        <>
          <div className="flex min-h-16 w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm shadow-sm">
            {formatPythonValue(item.value)}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              onClick={onStartEdit}
              aria-label={`Edit item ${index}`}
            >
              <PencilIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              onClick={onDelete}
              aria-label={`Delete item ${index}`}
            >
              <Trash2Icon />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ListCellEditor({
  item,
  index,
  onCancelEdit,
  onSave,
}: {
  item: ListItem;
  index: number;
  onCancelEdit: () => void;
  onSave: (value: PythonValue) => void;
}) {
  const [draft, setDraft] = useState<ValueDraft>(() => valueToDraft(item.value));
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const parsed = parseValueDraft(draft);
    if (isPlaygroundError(parsed)) {
      setError(parsed.friendlyMessage);
      return;
    }

    onSave(parsed);
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      <ValueField
        id={`list-item-${item.id}`}
        label={`Item ${index}`}
        value={draft}
        onChange={(next) => {
          setDraft(next);
          setError(null);
        }}
        compact
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          className="min-h-11 flex-1"
          onClick={handleSave}
        >
          <CheckIcon data-icon="inline-start" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={onCancelEdit}
          aria-label={`Cancel editing item ${index}`}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
}
