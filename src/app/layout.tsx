import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { env } from "@/lib/config/env";
import { fontVariables } from "./fonts";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(env().siteUrl),
    title: { default: "WITCHA MATCHA · Matcha, With Taste.", template: "%s · WITCHA MATCHA" },
    description: "Japanese matcha, chosen for taste. Which Matcha Today?",
    openGraph: {
      siteName: "WITCHA MATCHA",
      locale: "en_AU",
      type: "website",
      images: [{ url: "/art/heroes-01-academy-garden-desktop.jpg", width: 1800, height: 900 }],
    },
  };
}

export const viewport: Viewport = { themeColor: "#fffdf8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
