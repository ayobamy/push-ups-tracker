"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import {
  applyTheme,
  paintTheme,
  readStoredTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme/theme";
import { useLayoutEffect, useSyncExternalStore } from "react";

const serverTheme: Theme = "dark";

export function ThemeToggle({
  variant = "compact",
}: {
  variant?: "compact" | "row";
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    () => serverTheme,
  );

  useLayoutEffect(() => {
    paintTheme(theme);
  }, [theme]);

  function choose(next: Theme) {
    applyTheme(next);
  }

  if (variant === "row") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Appearance</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Theme">
          {(["light", "dark"] as const).map((option) => {
            const selected = theme === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(option)}
                className={`h-11 min-h-11 rounded-lg px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  selected
                    ? "bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950"
                    : "border border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {option === "light" ? "Light" : "Dark"}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={`Switch to ${next} mode`}
      onClick={() => choose(next)}
      className="fixed top-3 right-3 z-20 flex h-11 min-h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
