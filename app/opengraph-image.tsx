import { ImageResponse } from "next/og";

export const alt = "100 a Day — 100 push-ups a day for 365 days";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0a",
          color: "#ededed",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#18181b",
            color: "#f59e0b",
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          100
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          100 a Day
        </div>
        <div style={{ marginTop: 16, fontSize: 32, color: "#a1a1aa" }}>
          100 push-ups a day for 365 days.
        </div>
      </div>
    ),
    size,
  );
}
