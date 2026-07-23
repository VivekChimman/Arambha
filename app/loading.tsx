export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 animate-rise rounded-full bg-accent"
              style={{ animationDelay: `${i * 130}ms`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
        <p className="flex items-center gap-2 font-display text-lg text-fg">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg"
          >
            A
          </span>
          Arambha
        </p>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
