"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Today" },
  { href: "/app/board", label: "Board" },
  { href: "/app/you", label: "You" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="App"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {links.map((link) => {
          const current =
            link.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`flex h-14 min-h-11 items-center justify-center text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
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
