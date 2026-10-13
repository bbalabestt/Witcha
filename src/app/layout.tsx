import type { Metadata } from "next";
import "@/styles/globals.css";
import { fontVariables } from "./fonts";

export const metadata: Metadata = {
  title: { default: "WITCHA MATCHA · Matcha, With Taste.", template: "%s · WITCHA MATCHA" },
  description: "Japanese matcha, chosen for taste. Which Matcha Today?",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
