"use client";

import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ValueField } from "@/components/playground/ValueField";
import type { CellVisualState } from "@/lib/animations/highlights";
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
  interactive?: boolean;
  visualState?: CellVisualState;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (value: PythonValue) => void;
  onDelete?: () => void;
  className?: string;
};

export function ListCell({
  item,
  index,
  isEditing,
  interactive = true,
  visualState = "idle",
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  className,
}: ListCellProps) {
  return (
    <div
      data-list-cell
      data-flip-id={item.id}
      data-cell-state={visualState}
      className={cn(
        "flex min-w-40 shrink-0 flex-col items-center gap-2 md:min-w-52",
        isEditing && "min-w-56 md:min-w-64",
        className,
      )}
    >
      <span
        data-cell-index
        className="font-mono text-xs text-muted-foreground"
      >
        {index}
      </span>
      {isEditing && onCancelEdit && onSave ? (
        <ListCellEditor
          item={item}
          index={index}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
        />
      ) : (
        <>
          <div
            data-cell-body
            className="flex min-h-28 w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-5 font-mono text-lg shadow-[0_10px_24px_-18px_rgb(23_23_23_/_45%)] md:min-h-32 md:text-xl"
          >
            {formatPythonValue(item.value)}
          </div>
          {interactive && onStartEdit && onDelete ? (
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
          ) : null}
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
