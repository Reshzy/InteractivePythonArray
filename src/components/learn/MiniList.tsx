import { cn } from "@/lib/utils";

export type MiniListCell = {
  text: string;
  emphasized?: boolean;
};

export function MiniList({
  cells,
  label,
}: {
  cells: readonly MiniListCell[];
  label: string;
}) {
  return (
    <div
      role="group"
      className="flex flex-wrap items-center gap-1.5"
      aria-label={label}
    >
      {cells.map((cell, index) => (
        <span
          key={`${cell.text}-${index}`}
          className={cn(
            "rounded-md border px-2 py-1 font-mono text-xs",
            cell.emphasized
              ? "border-primary/40 bg-secondary text-foreground"
              : "border-border bg-muted/60 text-foreground",
          )}
        >
          {cell.text}
        </span>
      ))}
    </div>
  );
}
