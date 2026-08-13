import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <div
          style={{
            width: 150,
            height: 150,
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
