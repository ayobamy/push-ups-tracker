import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Public site has sitemap, robots, Open Graph, and a 100 mark
 * instead of the default Vercel/Next icon. Pass threshold: every case.
 */
describe("eval: seo and brand", () => {
  it("exports sitemap and robots from App Router files", () => {
    expect(readFileSync("app/sitemap.ts", "utf8")).toContain("sitemapEntries");
    expect(readFileSync("app/robots.ts", "utf8")).toContain("ROBOTS_DISALLOW");
  });

  it("sets metadataBase and Open Graph on the root layout", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain("metadataBase");
    expect(layout).toContain("openGraph");
  });

  it("ships a generated icon and an in-page brand mark", () => {
    expect(readFileSync("app/icon.svg", "utf8")).toContain("100");
    expect(readFileSync("app/favicon.ico").byteLength).toBeGreaterThan(32);
    expect(readFileSync("app/apple-icon.tsx", "utf8")).toContain("100");
    expect(readFileSync("app/page.tsx", "utf8")).toContain("BrandMark");
    expect(readFileSync("components/brand-mark.tsx", "utf8")).toContain(
      "LogoMark",
    );
  });

  it("sets titles on public pages and noindex on auth flows", () => {
    expect(readFileSync("app/page.tsx", "utf8")).toContain(
      'publicPageMetadata("/")',
    );
    expect(readFileSync("app/signup/page.tsx", "utf8")).toContain(
      'publicPageMetadata("/signup")',
    );
    expect(readFileSync("app/login/forgot/page.tsx", "utf8")).toContain(
      "NOINDEX",
    );
  });

  it("does not ship the Next/Vercel starter marks", () => {
    expect(() => readFileSync("public/vercel.svg")).toThrow();
    expect(() => readFileSync("public/next.svg")).toThrow();
  });
});
