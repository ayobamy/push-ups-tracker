import { BrandMark } from "@/components/brand-mark";
import { StoicFooter } from "@/components/stoic-footer";
import { publicPageMetadata } from "@/lib/seo/site";
import type { Metadata } from "next";

export const metadata: Metadata = publicPageMetadata("/privacy");

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-prose flex-col px-6 pt-16 pb-6">
      <div className="flex flex-1 flex-col gap-6">
        <BrandMark />
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p>
          We store your email (for login), the display name and timezone you
          choose, the push-up sets you log, and whether evening reminder mail is
          on.
        </p>
        <p>
          Challenge members can see your display name and daily totals,
          including when your day first reached 100. They cannot see your email.
        </p>
        <p>
          Evening reminders go from the same verified domain as auth mail, once
          per local day, only if you are still short of 100 at 20:00. Stop them
          from Settings or the unsubscribe link in the mail.
        </p>
        <p>Export your data or delete your account in Settings.</p>
      </div>
      <StoicFooter path="/privacy" />
    </main>
  );
}
