import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0c0d0f",
        panel: "rgba(255,255,255,0.08)",
        accent: "#ff8b2c",
        ink: "#f7f7f5",
        mute: "#969696"
      },
      boxShadow: {
        glass: "0 18px 48px rgba(0, 0, 0, 0.35)"
      },
      borderRadius: {
        card: "28px"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top left, rgba(255, 139, 44, 0.24), transparent 40%), radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 24%), linear-gradient(180deg, #131417 0%, #0b0b0d 100%)"
      }
    }
  },
  plugins: []
};

export default config;
