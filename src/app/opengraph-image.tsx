import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sagacity Network — UK Digital Product Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0D14 0%, #1A1128 50%, #0A0D14 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#F0ECF4",
              letterSpacing: "-0.03em",
              textAlign: "center",
            }}
          >
            SAGACITY
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 300,
              color: "rgba(240, 236, 244, 0.5)",
              letterSpacing: "0.28em",
              textTransform: "uppercase" as const,
            }}
          >
            NETWORK
          </div>
          <div
            style={{
              width: "80px",
              height: "2px",
              background: "linear-gradient(90deg, #7B3FA0, #C9A84C)",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          />
          <div
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(240, 236, 244, 0.6)",
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            UK Digital Product Studio
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "8px",
              fontSize: "14px",
              color: "rgba(240, 236, 244, 0.35)",
            }}
          >
            <span>Web Development</span>
            <span>·</span>
            <span>Data Intelligence</span>
            <span>·</span>
            <span>Automation</span>
            <span>·</span>
            <span>Cybersecurity</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
