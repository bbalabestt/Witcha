import localFont from "next/font/local";

// Latin-subset WOFF2 built from the brand CI TTFs (fontTools, Latin-1 + punctuation, all layout
// features). Only the faces used above the fold are preloaded. The Caslon italic TTF stays for the
// Open Graph image renderer, which cannot read WOFF2.

export const fontDisplay = localFont({
  src: [{ path: "../assets/fonts/LibreCaslonDisplay-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--wm-font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const fontSerif = localFont({
  src: [
    { path: "../assets/fonts/LibreCaslonText-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/LibreCaslonText-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--wm-font-serif",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const fontSans = localFont({
  src: [
    { path: "../assets/fonts/Jost-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/Jost-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--wm-font-sans",
  display: "swap",
  fallback: ["Avenir Next", "Segoe UI", "sans-serif"],
});

export const fontVariables = [fontDisplay.variable, fontSerif.variable, fontSans.variable].join(" ");
