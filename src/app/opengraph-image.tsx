import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "WITCHA MATCHA · Matcha, With Taste.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Supplied logo SVG (never retyped) and brand fonts, read once at module scope.
const logo = await readFile(join(process.cwd(), "public/logos/witcha-matcha_large_blue.svg"), "base64");
const serifItalic = await readFile(join(process.cwd(), "src/assets/fonts/LibreCaslonText-Italic.ttf"));

/** Default share image: Witcha-blue slab, ivory arch, logo and tagline (brand CI cover motif). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#A1D7D6", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 390,
            bottom: 0,
            width: 420,
            height: 520,
            background: "#FAF6EE",
            borderTopLeftRadius: 210,
            borderTopRightRadius: 210,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <img src={`data:image/svg+xml;base64,${logo}`} width={300} height={83} alt="" />
          <div style={{ fontFamily: "Caslon", fontStyle: "italic", fontSize: 34, color: "#2A5674" }}>Matcha, With Taste.</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Caslon", data: serifItalic, style: "italic", weight: 400 }] },
  );
}
