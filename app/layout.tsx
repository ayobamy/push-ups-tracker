import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicSiteOrigin, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import { THEME_BOOT_SCRIPT } from "@/lib/theme/theme";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-svh flex-col font-sans">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
