import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function markDataUri() {
  const file = path.join(
    process.cwd(),
    "public",
    "graphics",
    "signal-mark-icon.png",
  );
  const bytes = await fs.readFile(file);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function AppleIcon() {
  const mark = await markDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fcfbf9",
        }}
      >
        { }
        <img src={mark} alt="" width={156} height={156} />
      </div>
    ),
    size,
  );
}
