"use client";

import { MiniList } from "@/components/learn/MiniList";
import { TryItButton } from "@/components/learn/TryItButton";
import { COMPARISONS, type ComparisonSide } from "@/data/comparisons";
import {
  buildXRayAssignmentDescription,
  buildXRayCopyDescription,
} from "@/lib/playground/xray";

export function ComparisonLessons() {
  return (
    <ul className="flex flex-col gap-6">
      {COMPARISONS.map((comparison) => (
        <li
          key={comparison.id}
          id={`comparison-${comparison.id}`}
          className="scroll-mt-22 flex flex-col gap-4 rounded-xl border border-border bg-card px-4 py-5"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-mono text-sm font-medium">
              {`${comparison.left.title} vs ${comparison.right.title}`}
            </h3>
            <p className="text-sm text-muted-foreground">{comparison.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ComparisonColumn side={comparison.left} />
            <ComparisonColumn side={comparison.right} />
          </div>

          {comparison.id === "copy-assignment" ? (
            <CopyAssignmentDiagram />
          ) : null}

          <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
            {comparison.teachingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function ComparisonColumn({ side }: { side: ComparisonSide }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-mono text-sm font-medium">{side.title}</h4>
        <p className="text-xs text-muted-foreground">
          {side.mutates ? "Changes list" : "Does not change list"}
          {" · "}
          Returns {side.returns}
        </p>
      </div>

      <pre className="overflow-x-auto font-mono text-xs text-muted-foreground">
        <code>{side.code}</code>
      </pre>

      <p className="font-mono text-xs">
        Result: {side.result}
      </p>

      <MiniList
        cells={side.cells}
        label={`${side.title} result ${side.result}`}
      />

      {side.tryMethod ? (
        <TryItButton method={side.tryMethod} snapshot={side.tryIt}>
          {`Try ${side.title}`}
        </TryItButton>
      ) : null}
    </div>
  );
}

function CopyAssignmentDiagram() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs font-medium">copy()</p>
        <p className="sr-only">{buildXRayCopyDescription("a", "b")}</p>
        <div className="flex flex-col gap-2 font-mono text-xs text-muted-foreground">
          <p>a ───&gt; list A</p>
          <p>b ───&gt; list B</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs font-medium">assignment</p>
        <p className="sr-only">{buildXRayAssignmentDescription("a", "b")}</p>
        <pre className="font-mono text-xs text-muted-foreground">{`a ─┐
   ├──> same list
b ─┘`}</pre>
      </div>
    </div>
  );
}
