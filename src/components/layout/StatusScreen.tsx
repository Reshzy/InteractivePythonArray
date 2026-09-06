import type { ReactNode } from "react";

export function StatusScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16"
    >
      <div className="mx-auto max-w-lg text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 inline-flex size-10 items-center justify-center rounded-sm border border-foreground/20"
        >
          <span className="size-3 rounded-xs bg-primary" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      </div>
    </main>
  );
}
