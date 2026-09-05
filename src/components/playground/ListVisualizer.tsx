"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListCell } from "./ListCell";
import { pythonString } from "@/lib/python/values";
import { usePlaygroundStore } from "@/store/playground-store";

export function ListVisualizer() {
  const variableName = usePlaygroundStore((state) => state.variableName);
  const list = usePlaygroundStore((state) => state.list);
  const setVariableName = usePlaygroundStore((state) => state.setVariableName);
  const addListItem = usePlaygroundStore((state) => state.addListItem);
  const updateListItem = usePlaygroundStore((state) => state.updateListItem);
  const removeListItem = usePlaygroundStore((state) => state.removeListItem);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="list-visualizer-heading"
      className="rounded-xl border border-border bg-muted/40 p-4 md:p-6"
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
          {list.length} {list.length === 1 ? "item" : "items"}
        </p>
      </div>

      <h3 id="list-visualizer-heading" className="sr-only">
        {variableName}
      </h3>

      {list.length === 0 ? (
        <p className="mb-3 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          [] Your list is empty.
        </p>
      ) : (
        <ul className="mb-3 flex min-h-28 items-start gap-3 overflow-x-auto pb-2">
          {list.map((item, index) => (
            <li key={item.id}>
              <ListCell
                item={item}
                index={index}
                isEditing={editingId === item.id}
                onStartEdit={() => setEditingId(item.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(value) => {
                  updateListItem(item.id, value);
                  setEditingId(null);
                }}
                onDelete={() => {
                  if (editingId === item.id) {
                    setEditingId(null);
                  }
                  removeListItem(item.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={() => addListItem(pythonString("item"))}
      >
        <PlusIcon data-icon="inline-start" />
        Add item
      </Button>
    </section>
  );
}
