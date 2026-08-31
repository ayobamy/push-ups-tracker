import type { Metadata } from "next";
import { parseSiteOrigin } from "@/lib/auth/site-url";

export const SITE_NAME = "100 a Day";
export const SITE_TAGLINE =
  "100 push-ups a day for 365 days. Sign up and track.";

export const PUBLIC_PATHS = ["/", "/signup", "/login", "/privacy"] as const;

export const PUBLIC_PAGE_COPY = {
  "/": {
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  "/signup": {
    title: "Create an account",
    description:
      "Sign up with email and a password, then log 100 push-ups a day.",
  },
  "/login": {
    title: "Log in",
    description: "Log in to log today's sets and see the board.",
  },
  "/privacy": {
    title: "Privacy",
    description:
      "What 100 a Day stores, who on the board can see it, and how to export.",
  },
} as const;

export const ROBOTS_DISALLOW = [
  "/app/",
  "/auth/",
  "/api/",
  "/unsubscribe",
  "/update-password",
  "/login/forgot",
  "/login/sent",
];

export function publicSiteOrigin(
  raw = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  return parseSiteOrigin(raw) ?? "http://localhost:3000";
}

export function publicAbsoluteUrl(
  path: string,
  origin = publicSiteOrigin(),
): string {
  if (path === "/") {
    return origin;
  }
  return `${origin}${path}`;
}

export function sitemapEntries(origin = publicSiteOrigin()) {
  return PUBLIC_PATHS.map((path) => ({
    url: publicAbsoluteUrl(path, origin),
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.6,
  }));
}

export function publicPageMetadata(
  path: (typeof PUBLIC_PATHS)[number],
): Metadata {
  const copy = PUBLIC_PAGE_COPY[path];
  return {
    title: path === "/" ? { absolute: copy.title } : copy.title,
    description: copy.description,
    alternates: { canonical: path },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: publicAbsoluteUrl(path),
    },
  };
}

export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};
