import { LogoMark } from "@/components/logo-mark";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="font-display text-lg font-semibold tracking-tight">
        100 a Day
      </span>
    </Link>
  );
}
