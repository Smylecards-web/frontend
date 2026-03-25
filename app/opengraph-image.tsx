import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

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
          alignItems: "center",
          background:
            "radial-gradient(circle at 20% 20%, #3f3f46 0%, #18181b 45%, #09090b 100%)",
          color: "#ffffff",
          padding: "56px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85, letterSpacing: "0.2em" }}>
          SMYLECARDS
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 980,
          }}
        >
          Turn your event into a shared memory room
        </div>
      </div>
    ),
    size,
  );
}
