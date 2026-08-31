"use client";

import { isAppNavCurrent } from "@/lib/challenge/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Today" },
  { href: "/app/board", label: "Board" },
  { href: "/app/you", label: "You" },
  { href: "/app/purse", label: "Purse" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="App"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {links.map((link) => {
          const current = isAppNavCurrent(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`flex h-14 min-h-11 items-center justify-center px-1 text-center text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm ${
                  current ? "text-amber-700 dark:text-amber-400" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
