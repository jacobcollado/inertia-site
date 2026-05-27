import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Inertia - Shopify Themes & Web Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        {/* Accent glow */}
        <div style={{
          position: "absolute", bottom: -120, left: 80,
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, rgba(60,100,255,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          display: "flex",
        }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "rgb(60,100,255)",
              display: "flex",
            }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              byinertia.com
            </span>
          </div>
          <div style={{ color: "#ffffff", fontSize: 72, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            Inertia
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", maxWidth: 700 }}>
            Shopify themes and web studio for independent brands.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
