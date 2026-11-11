import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ALLOWED = new Set(["#a1d7d6", "#faf6ee", "#b39a62", "#383832", "#555450", "#ddd6c6", "#8e3328", "#648612", "#93723c"]);
const RETIRED_VARS =
  /--(wm-primary|brand-witcha-blue|brand-ivory|brand-aqua-light|brand-teal-soft|brand-blue-teal|brand-blue-mid|brand-deep-blue|brand-blush|brand-sage|white|surface-blush|surface-inverse|surface-soft|surface-muted|surface-hover|text-unread|text-on-dark|line-on-dark|foam-[a-z0-9-]+|action-secondary-fill)\b/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(css|tsx?)$/.test(p) ? [p] : [];
  });
}

describe("palette", () => {
  for (const file of files("src")) {
    it(`${file} uses only colour set v2`, () => {
      const text = readFileSync(file, "utf8");
      const bad = (text.match(/#[0-9a-f]{6}\b/gi) ?? []).filter((h) => !ALLOWED.has(h.toLowerCase()));
      expect(bad).toEqual([]);
      expect(text).not.toMatch(RETIRED_VARS);
    });
  }
});
