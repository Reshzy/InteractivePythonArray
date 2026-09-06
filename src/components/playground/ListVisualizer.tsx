"use client";

import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListCell } from "./ListCell";
import type { CellVisualState } from "@/lib/animations/highlights";
import type { SecondaryLabels } from "@/lib/animations/playback";
import {
  buildXRayCopyDescription,
  buildXRayView,
} from "@/lib/playground/xray";
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
  cellStates?: CellVisualState[];
};

function CellRow({
  items,
  track,
  interactive,
  editingId,
  cellStates,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  items: ListItem[];
  track: "list" | "incoming" | "secondary";
  interactive: boolean;
  editingId: string | null;
  cellStates?: CellVisualState[];
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
      className="flex min-h-52 items-start justify-center gap-6 overflow-x-auto pb-2 md:min-h-56 md:gap-8"
    >
      {items.map((item, index) => (
        <li key={item.id}>
          <ListCell
            item={item}
            index={index}
            isEditing={interactive && editingId === item.id}
            interactive={interactive}
            visualState={cellStates?.[index] ?? "idle"}
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

function EmptyList() {
  return (
    <p
      data-empty-state
      className="mb-3 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
    >
      [] Your list is empty.
    </p>
  );
}

function XRayPointer({ name }: { name: string }) {
  return (
    <div className="mb-3 flex flex-col items-start gap-1">
      <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
        Variable
      </p>
      <p className="font-mono text-sm font-medium">{name}</p>
      <span
        aria-hidden="true"
        className="ml-3 flex flex-col items-center text-muted-foreground"
      >
        <span className="h-4 w-px bg-border" />
        <ChevronDownIcon className="size-3.5" />
      </span>
    </div>
  );
}

function XRayTrack({
  name,
  items,
  track,
  lengthLabel,
  cellStates,
  interactive,
  editingId,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  name: string;
  items: ListItem[];
  track: "list" | "secondary";
  lengthLabel: string;
  cellStates?: CellVisualState[];
  interactive: boolean;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSave: (id: string, value: ListItem["value"]) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <XRayPointer name={name} />
      <div className="flex gap-3 overflow-x-auto">
        <div className="flex shrink-0 flex-col justify-center gap-8 pt-1">
          <p className="whitespace-nowrap text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Index
          </p>
          <p className="whitespace-nowrap text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Value
          </p>
        </div>
        <div className="min-w-0 flex-1">
          {items.length === 0 ? (
            <p
              data-empty-state={track === "list" ? "true" : undefined}
              className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
            >
              [] Your list is empty.
            </p>
          ) : (
            <CellRow
              items={items}
              track={track}
              interactive={interactive}
              editingId={editingId}
              cellStates={cellStates}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSave={onSave}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">{lengthLabel}</p>
    </div>
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
  cellStates,
}: ListVisualizerProps) {
  const variableName = usePlaygroundStore((state) => state.variableName);
  const setVariableName = usePlaygroundStore((state) => state.setVariableName);
  const addListItem = usePlaygroundStore((state) => state.addListItem);
  const updateListItem = usePlaygroundStore((state) => state.updateListItem);
  const removeListItem = usePlaygroundStore((state) => state.removeListItem);
  const xRayMode = usePlaygroundStore((state) => state.xRayMode);
  const [editingId, setEditingId] = useState<string | null>(null);

  const xray = buildXRayView(variableName, displayList);
  const copyView =
    Boolean(secondary) && secondaryLabels?.destination === "copied";
  const copyDescription =
    copyView && secondaryLabels
      ? buildXRayCopyDescription(secondaryLabels.source, secondaryLabels.destination)
      : null;

  const cellHandlers = {
    editingId,
    onStartEdit: setEditingId,
    onCancelEdit: () => setEditingId(null),
    onSave: (id: string, value: ListItem["value"]) => {
      updateListItem(id, value);
      setEditingId(null);
    },
    onDelete: (id: string) => {
      if (editingId === id) {
        setEditingId(null);
      }
      removeListItem(id);
    },
  };

  return (
    <section
      data-list-visualizer
      data-xray={xRayMode ? "true" : "false"}
      data-visualizer-error={visualizerError ? "true" : "false"}
      aria-labelledby="list-visualizer-heading"
      className={cn(
        "flex min-h-[46vh] flex-col justify-center py-4 md:min-h-[52vh]",
        visualizerError && "rounded-xl outline-2 outline-destructive/50",
      )}
    >
      <div className="mb-2 flex flex-wrap items-end gap-4 md:gap-8">
        <div className="flex min-w-24 flex-col gap-1">
          <Label htmlFor="variable-name" className="sr-only">
            Variable
          </Label>
          <Input
            id="variable-name"
            name="variableName"
            value={variableName}
            onChange={(event) => setVariableName(event.target.value)}
            className="h-auto min-h-11 border-0 bg-transparent px-0 font-mono text-lg shadow-none md:text-xl"
          />
          {xRayMode ? (
            <p className="font-mono text-xs text-muted-foreground">
              Length: {displayList.length}
            </p>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              {displayList.length} {displayList.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>
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
      {xRayMode ? (
        <p className="sr-only">
          {copyDescription ?? xray.description}
        </p>
      ) : null}

      {xRayMode && copyView && secondary && secondaryLabels ? (
        <div className="flex flex-col gap-6">
          <XRayTrack
            name={secondaryLabels.source}
            items={displayList}
            track="list"
            lengthLabel={`Length: ${displayList.length}`}
            cellStates={cellStates}
            interactive={interactive}
            {...cellHandlers}
          />
          <XRayTrack
            name={secondaryLabels.destination}
            items={secondary}
            track="secondary"
            lengthLabel={`Length: ${secondary.length}`}
            interactive={false}
            editingId={null}
            onStartEdit={() => undefined}
            onCancelEdit={() => undefined}
            onSave={() => undefined}
            onDelete={() => undefined}
          />
        </div>
      ) : xRayMode ? (
        <>
          {secondary && !copyView ? (
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Original
              {secondaryLabels ? ` · ${secondaryLabels.source}` : ""}
            </p>
          ) : null}
          <XRayTrack
            name={variableName}
            items={displayList}
            track="list"
            lengthLabel={`Length: ${displayList.length}`}
            cellStates={cellStates}
            interactive={interactive}
            {...cellHandlers}
          />
        </>
      ) : (
        <>
          {secondary ? (
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Original
              {secondaryLabels ? ` · ${secondaryLabels.source}` : ""}
            </p>
          ) : null}

          {displayList.length === 0 && incoming.length === 0 ? (
            <EmptyList />
          ) : (
            <div className="flex items-start gap-5 overflow-x-auto">
              {displayList.length === 0 ? (
                <EmptyList />
              ) : (
                <CellRow
                  items={displayList}
                  track="list"
                  interactive={interactive}
                  cellStates={cellStates}
                  {...cellHandlers}
                />
              )}
              {incoming.length > 0 ? (
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
              ) : null}
            </div>
          )}
        </>
      )}

      {secondary && !(xRayMode && copyView) ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {secondaryLabels?.destination === "sorted" ? "Sorted" : "Copy"}
            {secondaryLabels ? ` · ${secondaryLabels.destination}` : ""}
          </p>
          {xRayMode ? (
            <XRayTrack
              name={secondaryLabels?.destination ?? "copy"}
              items={secondary}
              track="secondary"
              lengthLabel={`Length: ${secondary.length}`}
              interactive={false}
              editingId={null}
              onStartEdit={() => undefined}
              onCancelEdit={() => undefined}
              onSave={() => undefined}
              onDelete={() => undefined}
            />
          ) : secondary.length === 0 ? (
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
        variant="ghost"
        className="mt-4 min-h-11 self-center text-muted-foreground"
        onClick={() => addListItem(pythonString("item"))}
        disabled={!interactive}
      >
        <PlusIcon data-icon="inline-start" />
        Add item
      </Button>
    </section>
  );
}
