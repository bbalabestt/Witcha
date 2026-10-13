import localFont from "next/font/local";

export const fontDisplay = localFont({
  src: [{ path: "../assets/fonts/LibreCaslonDisplay-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--wm-font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const fontSerif = localFont({
  src: [
    { path: "../assets/fonts/LibreCaslonText-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/LibreCaslonText-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--wm-font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const fontSans = localFont({
  src: [
    { path: "../assets/fonts/Jost-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Jost-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--wm-font-sans",
  display: "swap",
  fallback: ["Avenir Next", "Segoe UI", "sans-serif"],
});

export const fontVariables = [fontDisplay.variable, fontSerif.variable, fontSans.variable].join(" ");
