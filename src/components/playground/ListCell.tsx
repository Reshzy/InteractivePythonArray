import { cn } from "@/lib/utils";

type ListCellProps = {
  index: number;
  value: string;
  className?: string;
};

export function ListCell({ index, value, className }: ListCellProps) {
  return (
    <div
      data-list-cell
      className={cn(
        "flex min-w-28 shrink-0 flex-col items-center gap-1.5",
        className
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
      <div className="flex min-h-16 w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm shadow-sm">
        &quot;{value}&quot;
      </div>
    </div>
  );
}
