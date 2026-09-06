"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import { cn } from "@/lib/utils";

export function HistoryPanel() {
  const history = usePlaygroundStore((state) => state.history);
  const historyIndex = usePlaygroundStore((state) => state.historyIndex);

  return (
    <section
      aria-labelledby="history-heading"
      className="flex flex-col gap-3"
    >
      <h3 id="history-heading" className="text-sm font-medium">
        History
      </h3>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Run an operation to build a history of list changes.
        </p>
      ) : (
        <ol className="flex max-h-56 flex-col gap-1 overflow-y-auto font-mono text-xs">
          {history.map((entry, index) => {
            const isCurrent = index === historyIndex;
            const isFuture = index > historyIndex;

            return (
              <li
                key={entry.id}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "rounded-md px-2 py-1.5",
                  isCurrent && "bg-primary/10 text-foreground",
                  isFuture && "text-muted-foreground",
                  !isCurrent && !isFuture && "text-foreground",
                )}
              >
                <span className="text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}{" "}
                </span>
                {entry.code}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
