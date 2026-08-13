import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fcfbf9",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 46% 36%, #ff4d05 0%, #ff7a3c 34%, #ff96b0 62%, rgba(255,214,224,0.5) 82%, rgba(252,251,249,0) 96%)",
          }}
        />
      </div>
    ),
    size,
  );
}
