"use client";

export function RecapShare({ text }: { text: string }) {
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "100 a Day", text });
      return;
    }
    await navigator.clipboard.writeText(text);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="flex h-12 min-h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
    >
      Share
    </button>
  );
}
