export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
        <p className="text-xs text-muted-foreground">Python Lists Playground</p>
        <p
          data-creator-signature
          className="group cursor-default text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Made by kuya Rodge{" "}
          <span
            aria-hidden="true"
            className="inline-block origin-center transition-[color,transform] group-hover:scale-110 group-hover:text-primary motion-reduce:transition-colors motion-reduce:group-hover:scale-100"
          >
            &lt;3
          </span>
        </p>
      </div>
    </footer>
  );
}
