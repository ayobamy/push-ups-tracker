import { BrandMark } from "@/components/brand-mark";
import { StoicFooter } from "@/components/stoic-footer";
import {
  SITE_NAME,
  SITE_TAGLINE,
  publicPageMetadata,
  publicSiteOrigin,
} from "@/lib/seo/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = publicPageMetadata("/");

export default function HomePage() {
  const origin = publicSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: origin,
    applicationCategory: "HealthApplication",
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-6 pt-16 pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-1 flex-col justify-center gap-10">
        <div className="flex flex-col gap-4">
          <BrandMark />
          <h1 className="font-display text-5xl font-semibold tracking-tight">
            100 a day. 365 days.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Log sets through the day. 100 is the floor. You can do more. Share
            this link. Sign up. Track.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex h-14 min-h-11 items-center justify-center rounded-lg bg-zinc-900 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="text-center text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          I already have an account
        </Link>
        <Link
          href="/privacy"
          className="text-center text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Privacy
        </Link>
      </div>
      <StoicFooter path="/" />
    </main>
  );
}
