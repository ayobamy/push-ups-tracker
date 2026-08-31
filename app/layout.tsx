import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
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
  title: "100 a Day",
  description: "100 push-ups a day for 365 days. Sign up and track.",
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
