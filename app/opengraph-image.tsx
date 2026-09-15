import { ImageResponse } from "next/og"
import { SITE_TAGLINE } from "@/lib/site"

export const alt = `Subscription Tracker — ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a1214",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          color: "#e8ece9",
          position: "relative",
        }}
      >
        {/* Ambient */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
            borderRadius: 9999,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "white" }}>Subscription Tracker</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Obsidian Ledger · Cloud Sync</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 9999,
              padding: "6px 12px",
              fontSize: 12,
              color: "rgba(167,243,208,0.9)",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: 9999, background: "#6ee7b7" }} />
            Synced to edge
          </div>
        </div>

        <div style={{ display: "flex", gap: 48, alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-1.8px", color: "white" }}>
              Know what your
              <br />
              <span style={{ background: "linear-gradient(to bottom right, #a7f3d0, #5eead4)", backgroundClip: "text", color: "transparent" }}>
                subscriptions
              </span>
              <br />
              really cost.
            </span>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", marginTop: 16, lineHeight: 1.4 }}>
              True monthly spend, 12-month cash-flow, and your year as a receipt. Private by default, cloud sync when you want it.
            </span>
          </div>

          <div
            style={{
              width: 340,
              background: "#fdfcfa",
              color: "#17211f",
              borderRadius: 6,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transform: "rotate(1.5deg)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", textAlign: "center" }}>Your year in subscriptions</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, borderBottom: "1px dashed rgba(0,0,0,0.1)", paddingBottom: 8 }}>
              <span>Streaming</span>
              <span style={{ fontWeight: 700 }}>$33.98/mo</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
              <span>AI Tools</span>
              <span style={{ fontWeight: 700 }}>$45.00/mo</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
              <span>Software</span>
              <span style={{ fontWeight: 700 }}>$64.99/mo</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 8, paddingTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>Total per year</span>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>$2,214</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", position: "relative" }}>
          <span>Free · Private · Open source</span>
          <span style={{ color: "rgba(167,243,208,0.7)", fontWeight: 600 }}>Vercel + Cloudflare Workers + D1</span>
        </div>
      </div>
    ),
    size
  )
}
