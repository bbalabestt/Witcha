import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { env } from "@/lib/config/env";
import { SEO } from "@/lib/content/seo";
import { fontVariables } from "./fonts";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(env().siteUrl),
    // Titles are written in full per page (copy v5.3 §9), so no template adds to them.
    title: SEO.home.title,
    description: SEO.home.description,
    openGraph: { siteName: "WITCHA MATCHA", locale: "en_AU", type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#faf6ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
