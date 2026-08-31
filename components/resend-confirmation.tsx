"use client";

import { resendConfirmation } from "@/app/login/actions";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

const buttonClass =
  "h-12 min-h-11 w-full rounded-lg bg-zinc-900 px-4 text-base font-medium text-white disabled:opacity-50 dark:bg-amber-500 dark:text-zinc-950";

function SubmitButton({ waitSeconds }: { waitSeconds: number }) {
  const { pending } = useFormStatus();
  const waiting = waitSeconds > 0;
  let label = "Resend email";
  if (pending) {
    label = "Sending…";
  } else if (waiting) {
    label = `Resend in ${waitSeconds}s`;
  }

  return (
    <button type="submit" disabled={pending || waiting} className={buttonClass}>
      {label}
    </button>
  );
}

export function ResendConfirmation({
  email,
  startCooldown,
}: {
  email: string;
  startCooldown: boolean;
}) {
  const [wait, setWait] = useState(startCooldown ? 60 : 0);

  useEffect(() => {
    if (wait <= 0) {
      return;
    }
    const id = window.setTimeout(() => setWait((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  return (
    <form action={resendConfirmation}>
      <input type="hidden" name="email" value={email} />
      <SubmitButton waitSeconds={wait} />
    </form>
  );
}
