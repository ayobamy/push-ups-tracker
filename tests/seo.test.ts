import {
  PUBLIC_PAGE_COPY,
  PUBLIC_PATHS,
  ROBOTS_DISALLOW,
  publicAbsoluteUrl,
  publicPageMetadata,
  publicSiteOrigin,
  sitemapEntries,
} from "@/lib/seo/site";
import { describe, expect, it } from "vitest";

describe("publicSiteOrigin", () => {
  it("uses the env origin and strips a path", () => {
    expect(publicSiteOrigin("https://hundred.example/app")).toBe(
      "https://hundred.example",
    );
  });

  it("falls back to localhost", () => {
    expect(publicSiteOrigin("")).toBe("http://localhost:3000");
  });
});

describe("sitemapEntries", () => {
  it("lists only public pages on the site origin", () => {
    const entries = sitemapEntries("https://hundred.example");
    expect(entries.map((row) => row.url)).toEqual([
      "https://hundred.example",
      "https://hundred.example/signup",
      "https://hundred.example/login",
      "https://hundred.example/privacy",
    ]);
    expect(PUBLIC_PATHS).toContain("/");
    expect(publicAbsoluteUrl("/signup", "https://hundred.example")).toBe(
      "https://hundred.example/signup",
    );
  });
});

describe("robots disallow", () => {
  it("keeps the logged-in app and auth callbacks out of the index", () => {
    expect(ROBOTS_DISALLOW).toContain("/app/");
    expect(ROBOTS_DISALLOW).toContain("/auth/");
  });
});

describe("public page metadata", () => {
  it("gives every public path a distinct title and description", () => {
    const titles = PUBLIC_PATHS.map((path) => PUBLIC_PAGE_COPY[path].title);
    expect(new Set(titles).size).toBe(PUBLIC_PATHS.length);
    for (const path of PUBLIC_PATHS) {
      const meta = publicPageMetadata(path);
      expect(meta.description).toBe(PUBLIC_PAGE_COPY[path].description);
      expect(meta.alternates).toEqual({ canonical: path });
    }
  });

  it("uses an absolute title on the home page so the template does not double", () => {
    expect(publicPageMetadata("/").title).toEqual({ absolute: "100 a Day" });
    expect(publicPageMetadata("/login").title).toBe("Log in");
  });
});
