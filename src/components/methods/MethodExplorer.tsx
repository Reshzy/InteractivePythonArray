"use client";

import { useMemo, useState } from "react";

import { TryItButton } from "@/components/learn/TryItButton";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  isBuiltinOperation,
  METHOD_CATEGORIES,
  type MethodDefinition,
} from "@/data/methods";
import { searchLearningContent } from "@/lib/playground/search-methods";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/store/playground-store";

export function MethodExplorer() {
  const [query, setQuery] = useState("");
  const selectedMethod = usePlaygroundStore((state) => state.selectedMethod);
  const results = useMemo(() => searchLearningContent(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      <Field className="max-w-md">
        <FieldLabel htmlFor="method-search">Search methods</FieldLabel>
        <Input
          id="method-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search methods..."
          autoComplete="off"
          className="min-h-11"
        />
      </Field>

      {hasQuery && results.comparisons.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Related comparisons:{" "}
          {results.comparisons.map((comparison, index) => (
            <span key={comparison.id}>
              {index > 0 ? ", " : null}
              <a
                href={`#comparison-${comparison.id}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {comparison.left.title} vs {comparison.right.title}
              </a>
            </span>
          ))}
        </p>
      ) : null}

      {results.methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No methods match that search.
        </p>
      ) : (
        METHOD_CATEGORIES.map((category) => {
          const methods = results.methods.filter(
            (method) => method.category === category.id,
          );
          if (methods.length === 0) {
            return null;
          }

          return (
            <div key={category.id} className="flex flex-col gap-3">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {category.label}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {methods.map((method) => (
                  <MethodCard
                    key={method.id}
                    method={method}
                    selected={method.id === selectedMethod}
                  />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}

function MethodCard({
  method,
  selected,
}: {
  method: MethodDefinition;
  selected: boolean;
}) {
  const builtin = isBuiltinOperation(method);

  return (
    <li
      id={`method-${method.id}`}
      className={cn(
        "flex scroll-mt-22 flex-col gap-3 rounded-xl border bg-card px-4 py-4",
        selected ? "border-primary" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h4 className="font-mono text-sm font-medium">{method.label}</h4>
          <p className="font-mono text-xs text-muted-foreground">
            {method.syntax}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {selected ? <Badge variant="outline">In playground</Badge> : null}
          {builtin ? <Badge variant="secondary">Built-in</Badge> : null}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {method.shortDescription}
      </p>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">Changes list</dt>
          <dd className="font-medium">{method.mutates ? "Yes" : "No"}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">Returns</dt>
          <dd className="font-mono">{method.returnType}</dd>
        </div>
      </dl>

      <pre className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
        <code>
          {`${method.example.setup}
${method.example.call}
# ${method.example.result}`}
        </code>
      </pre>

      <details>
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium">
          Advanced
        </summary>
        <div className="flex flex-col gap-2 pb-1 pt-2 text-sm text-muted-foreground">
          <p>
            {method.label}: {method.complexity}
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {method.advanced.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </details>

      <TryItButton method={method.id} snapshot={method.tryIt} />
    </li>
  );
}
