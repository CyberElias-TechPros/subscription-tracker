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
          background: "#faf9f5",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          color: "#1c2426",
          position: "relative",
        }}
      >
        {/* Fine grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(28,36,38,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,36,38,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Soft accent wash */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: "50%",
            width: 900,
            height: 500,
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse at center, rgba(14,138,103,0.10), transparent 65%)",
            borderRadius: 9999,
          }}
        />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#141f21",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 22,
                height: 26,
                background: "#faf9f5",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <div style={{ width: 12, height: 2, background: "#141f21", opacity: 0.45, borderRadius: 1 }} />
              <div style={{ width: 12, height: 2, background: "#141f21", opacity: 0.45, borderRadius: 1 }} />
              <div style={{ width: 7, height: 2, background: "#141f21", opacity: 0.45, borderRadius: 1 }} />
              <div style={{ width: 5, height: 5, borderRadius: 9999, background: "#0e8a67", marginTop: 1 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#141f21" }}>Subscription Tracker</span>
            <span style={{ fontSize: 12, color: "rgba(28,36,38,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Paper Ledger · Cloud Sync
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(14,138,103,0.08)",
              border: "1px solid rgba(14,138,103,0.2)",
              borderRadius: 9999,
              padding: "6px 12px",
              fontSize: 12,
              color: "#0b6f52",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: 9999, background: "#0e8a67" }} />
            Synced to edge
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "flex", gap: 48, alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 54, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-2px", color: "#141f21" }}>
              Know what your
              <br />
              <span style={{ color: "#0e8a67" }}>subscriptions</span>
              <br />
              really cost.
            </span>
            <span style={{ fontSize: 19, color: "rgba(28,36,38,0.55)", marginTop: 18, lineHeight: 1.4 }}>
              True monthly spend, 12-month cash-flow, and your year as a receipt. Private by default, cloud sync when you want it.
            </span>
          </div>

          {/* Receipt */}
          <div
            style={{
              width: 330,
              background: "#f8f5ec",
              color: "#1c2426",
              borderRadius: 6,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transform: "rotate(1.5deg)",
              boxShadow: "0 24px 60px rgba(20,31,33,0.18)",
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", textAlign: "center" }}>Your year in subscriptions</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, borderBottom: "1px dashed rgba(0,0,0,0.12)", paddingBottom: 8 }}>
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

        {/* Footer row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "rgba(28,36,38,0.45)", position: "relative" }}>
          <span>Free · Private · Open source</span>
          <span style={{ color: "#0b6f52", fontWeight: 600 }}>Vercel + Cloudflare Workers + D1</span>
        </div>
      </div>
    ),
    size
  )
}
