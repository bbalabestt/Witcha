import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { SITE } from "@/lib/config/site";
import { fontVariables } from "./fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: "Japanese matcha, chosen for taste. Which Matcha Today?",
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_AU" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
