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
          background: "#0e181b",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#e8ece9",
        }}
      >
        {/* Wordmark row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#e8ece9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 30,
                height: 38,
                background: "#0e181b",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
                paddingLeft: 6,
                paddingRight: 6,
              }}
            >
              <div style={{ width: 18, height: 3, background: "#0e181b", opacity: 0.45, borderRadius: 2 }} />
              <div style={{ width: 18, height: 3, background: "#0e181b", opacity: 0.45, borderRadius: 2 }} />
              <div style={{ width: 10, height: 3, background: "#57e6b4", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.5px" }}>
              Subscription Tracker
            </span>
            <span style={{ fontSize: 18, color: "#8fa3a0" }}>Free · Private · Local-first</span>
          </div>
        </div>

        {/* Receipt card */}
        <div
          style={{
            display: "flex",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <span style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px" }}>
              Know what your subscriptions really cost.
            </span>
            <span style={{ fontSize: 26, color: "#8fa3a0", marginTop: 18, lineHeight: 1.4 }}>
              True monthly spend, upcoming payments and the honest yearly number — stored only in
              your browser.
            </span>
          </div>

          <div
            style={{
              width: 330,
              background: "#f5f2ea",
              color: "#17211f",
              borderRadius: 10,
              padding: "28px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transform: "rotate(2deg)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}>
              <span>Netflix</span>
              <span style={{ fontWeight: 600 }}>$17.99</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}>
              <span>ChatGPT Plus</span>
              <span style={{ fontWeight: 600 }}>$20.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}>
              <span>Spotify Duo</span>
              <span style={{ fontWeight: 600 }}>$16.99</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}>
              <span>iCloud+</span>
              <span style={{ fontWeight: 600 }}>$9.99</span>
            </div>
            <div style={{ borderTop: "2px dashed #17211f55", paddingTop: 14, display: "flex", justifyContent: "space-between", fontSize: 18, color: "#5c6a67" }}>
              <div style={{ display: "flex" }}>
                <span>PER YEAR</span>
                <span style={{ fontWeight: 700, color: "#0da678" }}>$775.08</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#8fa3a0",
          }}
        >
          <span>v0-subscription-tracker.vercel.app</span>
          <span style={{ color: "#57e6b4", fontWeight: 600 }}>No account · No tracking · No server</span>
        </div>
      </div>
    ),
    size,
  )
}
