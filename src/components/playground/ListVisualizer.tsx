"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListCell } from "./ListCell";
import type { SecondaryLabels } from "@/lib/animations/playback";
import { pythonString } from "@/lib/python/values";
import type { ListItem } from "@/lib/python/types";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/store/playground-store";

type ListVisualizerProps = {
  displayList: ListItem[];
  incoming: ListItem[];
  secondary: ListItem[] | null;
  secondaryLabels: SecondaryLabels | null;
  scanCount: number | null;
  disclaimer: string | null;
  visualizerError: boolean;
  interactive: boolean;
};

function CellRow({
  items,
  track,
  interactive,
  editingId,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  items: ListItem[];
  track: "list" | "incoming" | "secondary";
  interactive: boolean;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSave: (id: string, value: ListItem["value"]) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      data-track={track}
      className="flex min-h-28 items-start gap-3 overflow-x-auto pb-2"
    >
      {items.map((item, index) => (
        <li key={item.id}>
          <ListCell
            item={item}
            index={index}
            isEditing={interactive && editingId === item.id}
            interactive={interactive}
            onStartEdit={() => onStartEdit(item.id)}
            onCancelEdit={onCancelEdit}
            onSave={(value) => onSave(item.id, value)}
            onDelete={() => onDelete(item.id)}
          />
        </li>
      ))}
    </ul>
  );
}

export function ListVisualizer({
  displayList,
  incoming,
  secondary,
  secondaryLabels,
  scanCount,
  disclaimer,
  visualizerError,
  interactive,
}: ListVisualizerProps) {
  const variableName = usePlaygroundStore((state) => state.variableName);
  const setVariableName = usePlaygroundStore((state) => state.setVariableName);
  const addListItem = usePlaygroundStore((state) => state.addListItem);
  const updateListItem = usePlaygroundStore((state) => state.updateListItem);
  const removeListItem = usePlaygroundStore((state) => state.removeListItem);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section
      data-list-visualizer
      data-visualizer-error={visualizerError ? "true" : "false"}
      aria-labelledby="list-visualizer-heading"
      className={cn(
        "rounded-xl border border-border bg-muted/40 p-4 md:p-6",
        visualizerError && "border-destructive",
      )}
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex min-w-40 flex-col gap-1.5">
          <Label htmlFor="variable-name">Variable</Label>
          <Input
            id="variable-name"
            name="variableName"
            value={variableName}
            onChange={(event) => setVariableName(event.target.value)}
            className="min-h-11 font-mono"
          />
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {displayList.length} {displayList.length === 1 ? "item" : "items"}
        </p>
        {scanCount !== null ? (
          <p
            data-scan-count
            className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-medium text-primary"
          >
            Count: {scanCount}
          </p>
        ) : null}
      </div>

      <h3 id="list-visualizer-heading" className="sr-only">
        {variableName}
      </h3>

      {secondary ? (
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Original
          {secondaryLabels ? ` · ${secondaryLabels.source}` : ""}
        </p>
      ) : null}

      {displayList.length === 0 ? (
        <p
          data-empty-state
          className="mb-3 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
        >
          [] Your list is empty.
        </p>
      ) : (
        <CellRow
          items={displayList}
          track="list"
          interactive={interactive}
          editingId={editingId}
          onStartEdit={setEditingId}
          onCancelEdit={() => setEditingId(null)}
          onSave={(id, value) => {
            updateListItem(id, value);
            setEditingId(null);
          }}
          onDelete={(id) => {
            if (editingId === id) {
              setEditingId(null);
            }
            removeListItem(id);
          }}
        />
      )}

      {incoming.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Incoming values
          </p>
          <CellRow
            items={incoming}
            track="incoming"
            interactive={false}
            editingId={null}
            onStartEdit={() => undefined}
            onCancelEdit={() => undefined}
            onSave={() => undefined}
            onDelete={() => undefined}
          />
        </div>
      ) : null}

      {secondary ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {secondaryLabels?.destination === "sorted" ? "Sorted" : "Copy"}
            {secondaryLabels ? ` · ${secondaryLabels.destination}` : ""}
          </p>
          {secondary.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              []
            </p>
          ) : (
            <CellRow
              items={secondary}
              track="secondary"
              interactive={false}
              editingId={null}
              onStartEdit={() => undefined}
              onCancelEdit={() => undefined}
              onSave={() => undefined}
              onDelete={() => undefined}
            />
          )}
        </div>
      ) : null}

      {disclaimer ? (
        <p className="mt-3 text-xs text-muted-foreground">{disclaimer}</p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="mt-3 min-h-11"
        onClick={() => addListItem(pythonString("item"))}
        disabled={!interactive}
      >
        <PlusIcon data-icon="inline-start" />
        Add item
      </Button>
    </section>
  );
}
