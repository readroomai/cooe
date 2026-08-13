import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

export const alt = "Cooe — See what they hear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Inlined at build time — Satori cannot fetch a relative asset. */
async function signalDataUri() {
  const file = path.join(process.cwd(), "public", "graphics", "signal-hero-flat.png");
  const bytes = await fs.readFile(file);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function OpengraphImage() {
  const signal = await signalDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fcfbf9",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        { }
        <img
          src={signal}
          alt=""
          width={660}
          height={660}
          style={{ position: "absolute", top: -150, right: -110 }}
        />

        <div style={{ display: "flex", fontSize: 30, color: "#14110f" }}>cooe</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 104,
              color: "#14110f",
              letterSpacing: -3,
              lineHeight: 1.02,
            }}
          >
            See what they hear.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 28,
              color: "#6f6862",
            }}
          >
            {SITE.positioning}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #e8e2db",
            paddingTop: 26,
            fontSize: 24,
            color: "#9a938c",
          }}
        >
          <div style={{ display: "flex", color: "#14110f" }}>{SITE.domain}</div>
          <div style={{ display: "flex" }}>Free beta · no account</div>
        </div>
      </div>
    ),
    size,
  );
}
