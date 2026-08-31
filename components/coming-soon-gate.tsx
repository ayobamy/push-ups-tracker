export function ComingSoonGate({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate">
      <div
        className="pointer-events-none select-none blur-md"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <div className="absolute inset-0 bg-white/55 dark:bg-zinc-950/55">
        <p
          role="status"
          className="sticky top-20 mx-auto mt-16 w-fit rounded-lg border border-amber-500 bg-white px-4 py-3 font-display text-lg font-semibold text-amber-800 dark:bg-zinc-950 dark:text-amber-400"
        >
          Coming soon
        </p>
      </div>
    </div>
  );
}
