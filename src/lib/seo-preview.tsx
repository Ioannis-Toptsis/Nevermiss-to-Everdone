import { siteConfig } from "@/lib/seo";

const background =
  "radial-gradient(circle at top left, rgba(39, 216, 239, 0.3) 0%, rgba(39, 216, 239, 0) 38%), linear-gradient(135deg, #050913 0%, #0b1626 50%, #0a1320 100%)";

export function SeoPreview() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background,
        color: "#f8fbff",
        padding: 60,
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 32,
          borderRadius: 32,
          border: "1px solid rgba(255, 255, 255, 0.12)"
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          zIndex: 1
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 92,
              height: 92,
              borderRadius: 24,
              background: "#27d8ef",
              color: "#08111b",
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: "0.14em"
            }}
          >
            NTE
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.68)"
              }}
            >
              {siteConfig.shortName}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 860,
                fontSize: 54,
                lineHeight: 1.05,
                fontWeight: 800
              }}
            >
              Neverness to Everness checklist and reset tracker
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 28
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.82)"
              }}
            >
              Track dailies, weeklys, reset timers, useful links, and synced progress with Nevermiss to Everdone.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                "Dailies",
                "Weeklys",
                "Reset timer",
                "Useful links",
                "Sync progress"
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "12px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    background: "rgba(255, 255, 255, 0.06)",
                    fontSize: 18,
                    color: "rgba(255, 255, 255, 0.88)"
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.58)"
              }}
            >
              {siteConfig.name}
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "rgba(255, 255, 255, 0.72)" }}>
              Unofficial NTE companion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeoIcon() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background,
        color: "#f8fbff",
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "78%",
          height: "78%",
          borderRadius: "24%",
          border: "12px solid rgba(255, 255, 255, 0.16)",
          background: "rgba(8, 17, 27, 0.72)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.3)",
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: "0.12em"
        }}
      >
        NTE
      </div>
    </div>
  );
}