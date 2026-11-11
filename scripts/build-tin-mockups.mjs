#!/usr/bin/env node
/**
 * Renders the stand-in pack shots: a white matcha tin and a black hojicha tin (vendor list: "matcha in white
 * tins, hojicha in the black tin"), with the real wordmark from public/logos and the brand arch left empty.
 * No cat, no AI art. Output: transparent PNGs in src/assets/mockups, shown faded until photography exists.
 *
 * Run: node scripts/build-tin-mockups.mjs   (needs Google Chrome, used through Playwright)
 * The colours here are packaging, not theme colours, so they live outside src/ and the palette test.
 */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "src/assets/mockups");
mkdirSync(out, { recursive: true });

const logoSvg = readFileSync(path.join(root, "public/logos/witcha-matcha_large_charcoal.svg"), "utf8");
const logo = (fill) => `data:image/svg+xml;base64,${Buffer.from(logoSvg.replaceAll("#383832", fill)).toString("base64")}`;

const TINS = {
  white: {
    body: ["#cfccc4", "#ece9e2", "#fbfaf7", "#ffffff", "#efede7", "#c4c1b9"],
    lid: ["#c9c6be", "#e9e6df", "#fbfaf7", "#ffffff", "#ebe8e1", "#bdbab2"],
    top: "#f7f5f0",
    rim: "#b9b6ae",
    ink: "#383832",
    rule: "#b39a62",
    shine: 0.35,
  },
  black: {
    body: ["#090908", "#1f1f1d", "#343431", "#3e3e3b", "#242422", "#070706"],
    lid: ["#0b0b0a", "#232321", "#383835", "#42423f", "#262624", "#090908"],
    top: "#2e2e2b",
    rim: "#000000",
    ink: "#faf6ee",
    rule: "#b39a62",
    shine: 0.1,
  },
};

function gradient(id, stops) {
  const at = [0, 0.16, 0.36, 0.48, 0.72, 1];
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${stops.map((c, i) => `<stop offset="${at[i]}" stop-color="${c}"/>`).join("")}</linearGradient>`;
}

function tin(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="540" viewBox="0 0 400 540">
  <defs>
    ${gradient("body", t.body)}
    ${gradient("lid", t.lid)}
    <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${t.shine}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse cx="200" cy="508" rx="170" ry="22" fill="url(#shadow)"/>
  <!-- Body: a cylinder with a curved base. -->
  <path d="M72 128 V488 A128 20 0 0 0 328 488 V128 Z" fill="url(#body)"/>
  <rect x="150" y="140" width="22" height="350" fill="url(#shine)"/>
  <!-- Label: wordmark, gold rules and the empty brand arch. -->
  <path d="M86 214 Q200 226 314 214" fill="none" stroke="${t.rule}" stroke-width="1.6"/>
  <image href="${logo(t.ink)}" x="112" y="232" width="176" height="49"/>
  <path d="M86 300 Q200 312 314 300" fill="none" stroke="${t.rule}" stroke-width="1.6"/>
  <path d="M152 452 V378 A48 48 0 0 1 248 378 V452" fill="none" stroke="${t.rule}" stroke-width="1.6"/>
  <path d="M86 466 Q200 478 314 466" fill="none" stroke="${t.rule}" stroke-width="1.2" opacity="0.7"/>
  <!-- Lid: slightly wider, with its own rim and a lit top. -->
  <path d="M64 70 V132 A136 20 0 0 0 336 132 V70 Z" fill="url(#lid)"/>
  <path d="M64 132 A136 20 0 0 0 336 132" fill="none" stroke="${t.rim}" stroke-width="1.5" opacity="0.6"/>
  <ellipse cx="200" cy="70" rx="136" ry="20" fill="${t.top}"/>
  <ellipse cx="200" cy="70" rx="136" ry="20" fill="none" stroke="${t.rim}" stroke-width="1" opacity="0.5"/>
  <rect x="146" y="74" width="20" height="56" fill="url(#shine)"/>
</svg>`;
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const [name, t] of Object.entries(TINS)) {
  await page.setContent(`<html><body style="margin:0;background:transparent">${tin(t)}</body></html>`);
  await page.locator("svg").screenshot({ path: path.join(out, `tin-${name}.png`), omitBackground: true });
  console.log(`src/assets/mockups/tin-${name}.png`);
}
await browser.close();
