import { AppNav } from "@/app/app/nav";
import { AppTopBar } from "@/app/app/top-bar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col pt-16 pb-24">
      <AppTopBar />
      {children}
      <AppNav />
    </div>
  );
}
