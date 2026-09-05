import { ListCell } from "./ListCell";

type ListVisualizerProps = {
  variableName: string;
  values: readonly string[];
};

export function ListVisualizer({ variableName, values }: ListVisualizerProps) {
  return (
    <section
      aria-labelledby="list-visualizer-heading"
      className="rounded-xl border border-border bg-muted/40 p-4 md:p-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h3
          id="list-visualizer-heading"
          className="font-mono text-sm font-medium"
        >
          {variableName}
        </h3>
        <p className="font-mono text-xs text-muted-foreground">
          {values.length} {values.length === 1 ? "item" : "items"}
        </p>
      </div>

      {values.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          [] Your list is empty.
        </p>
      ) : (
        <ul className="flex min-h-28 items-start gap-3 overflow-x-auto pb-2">
          {values.map((value, index) => (
            <li key={`${index}-${value}`}>
              <ListCell index={index} value={value} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
