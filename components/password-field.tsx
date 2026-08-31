"use client";

import { visibilityLabel } from "@/lib/auth/visibility";
import { useState } from "react";

const inputClass =
  "h-12 w-full rounded-lg border border-zinc-300 bg-white pr-12 pl-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete: string;
  fieldName?: string;
};

export function PasswordField({
  name,
  label,
  autoComplete,
  fieldName = "password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = `${name}-input`;

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <label htmlFor={inputId}>{label}</label>
      <span className="relative block">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          name={name}
          required
          minLength={8}
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((open) => !open)}
          aria-label={visibilityLabel(visible, fieldName)}
          aria-pressed={visible}
          className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.5 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.3 4.3" />
      <path d="M6.7 6.7C3.8 8.6 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.3-.9" />
    </svg>
  );
}
