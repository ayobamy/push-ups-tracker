function Bone({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800 ${className}`}
    />
  );
}

export function PageSkeleton({
  variant,
}: {
  variant: "today" | "board" | "you" | "settings";
}) {
  return (
    <main
      className="flex flex-col gap-6 px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading</p>
      <Bone className="h-10 w-40" />
      <Bone className="h-4 w-64" />
      {variant === "today" ? <TodayBones /> : null}
      {variant === "board" ? <BoardBones /> : null}
      {variant === "you" ? <YouBones /> : null}
      {variant === "settings" ? <SettingsBones /> : null}
    </main>
  );
}

function TodayBones() {
  return (
    <>
      <Bone className="h-24 w-28" />
      <div className="grid grid-cols-4 gap-2">
        <Bone className="h-12" />
        <Bone className="h-12" />
        <Bone className="h-12" />
        <Bone className="h-12" />
      </div>
      <Bone className="h-12 w-full" />
      <Bone className="h-12 w-full" />
    </>
  );
}

function BoardBones() {
  return (
    <>
      <div className="flex gap-2">
        <Bone className="h-11 w-20" />
        <Bone className="h-11 w-20" />
        <Bone className="h-11 w-20" />
      </div>
      <Bone className="h-14 w-full" />
      <Bone className="h-14 w-full" />
      <Bone className="h-14 w-full" />
    </>
  );
}

function YouBones() {
  return (
    <>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
      >
        {Array.from({ length: 56 }, (_, index) => (
          <Bone key={index} className="h-4 w-4 rounded-sm" />
        ))}
      </div>
      <Bone className="h-12 w-full" />
    </>
  );
}

function SettingsBones() {
  return (
    <>
      <Bone className="h-12 w-full" />
      <Bone className="h-12 w-full" />
      <Bone className="h-12 w-full" />
      <Bone className="h-12 w-full" />
    </>
  );
}
