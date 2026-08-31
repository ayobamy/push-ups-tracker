"use client";

import { isRecapPath } from "@/lib/challenge/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppTopBar() {
  const pathname = usePathname();
  const recap = isRecapPath(pathname);

  return (
    <Link
      href="/app/you/recap"
      aria-label="Year recap"
      aria-current={recap ? "page" : undefined}
      className={`fixed top-3 left-3 z-20 flex h-11 min-h-11 items-center rounded-lg border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        recap
          ? "border-amber-500 bg-amber-500 text-zinc-950"
          : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      }`}
    >
      Recap
    </Link>
  );
}
