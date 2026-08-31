"use client";

import { recapCardSvg, recapDownloadName } from "@/lib/challenge/recap-svg";
import { useState } from "react";

type Format = "png" | "svg" | "jpg";

const formats: { id: Format; label: string }[] = [
  { id: "png", label: "PNG" },
  { id: "svg", label: "SVG" },
  { id: "jpg", label: "JPG" },
];

export function RecapExport({
  name,
  daysHit,
  longest,
  cells,
}: {
  name: string;
  daysHit: number;
  longest: number;
  cells: { date: string; reps: number }[];
}) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [failed, setFailed] = useState(false);

  async function download(format: Format) {
    setBusy(format);
    setFailed(false);
    try {
      const svg = recapCardSvg({ name, daysHit, longest, cells });
      const filename = recapDownloadName(name, format);
      if (format === "svg") {
        triggerDownload(
          new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          filename,
        );
        return;
      }
      const blob = await rasterizeSvg(
        svg,
        format === "png" ? "image/png" : "image/jpeg",
      );
      triggerDownload(blob, filename);
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Download recap"
      >
        {formats.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={busy !== null}
            aria-busy={busy === item.id}
            onClick={() => void download(item.id)}
            className="flex h-12 min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 dark:border-zinc-700"
          >
            {item.label}
          </button>
        ))}
      </div>
      {failed ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          Could not build that file. Try SVG.
        </p>
      ) : null}
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function rasterizeSvg(
  svg: string,
  mime: "image/png" | "image/jpeg",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("blob"));
            return;
          }
          resolve(blob);
        },
        mime,
        mime === "image/jpeg" ? 0.92 : undefined,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("svg"));
    };
    image.src = url;
  });
}
