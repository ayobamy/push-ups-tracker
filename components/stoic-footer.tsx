import { quoteForPath } from "@/lib/quotes/stoic";

export function StoicFooter({ path }: { path: string }) {
  const quote = quoteForPath(path);

  return (
    <footer className="mt-auto border-t border-zinc-200 pt-8 pb-4 dark:border-zinc-800">
      <blockquote className="flex flex-col gap-2">
        <p className="font-display text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          “{quote.text}”
        </p>
        <cite className="text-sm text-zinc-500 not-italic">
          {quote.attribution}
        </cite>
      </blockquote>
    </footer>
  );
}
