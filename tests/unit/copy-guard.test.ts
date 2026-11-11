import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Retired lines and claims the client ruled out (copy v5.3 copy rules, vendor list "Remove"). */
const BANNED = [
  "Good Matcha",
  "Worth the Whisk",
  "A Little Magic",
  "Every tin",
  "Pop tastes",
  "keeper",
  "Dreamer",
  "Charmer",
  "Pinterest",
  "Klaviyo",
  "✦",
  "$[",
  "[x",
  "[city]",
  "[pending]",
  "SAMPLE DATA",
  "incl. GST",
  "A few letters",
  "made for",
  "crafted",
  "our blend",
  "caffeine-free",
  "low caffeine",
  "bedtime",
  "ceremonial",
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

const SOURCE = files("src").filter((f) => /\.(tsx?|css)$/.test(f));

// Supplier names must not appear even here, so they live in a gitignored file. Skipped when it is absent.
const TERMS_FILE = "tests/.internal-terms.txt";
const INTERNAL = existsSync(TERMS_FILE) ? readFileSync(TERMS_FILE, "utf8").split("\n").filter(Boolean) : [];

describe("copy guard", () => {
  it.each(SOURCE)("%s has no retired copy or placeholder", (file) => {
    const text = readFileSync(file, "utf8").toLowerCase();
    expect(BANNED.filter((b) => text.includes(b.toLowerCase()))).toEqual([]);
  });

  it("uses 'magic' nowhere yet (at most once, on the Academy page, once the cat is final)", () => {
    expect(SOURCE.filter((f) => /\bmagic\b/i.test(readFileSync(f, "utf8")))).toEqual([]);
  });

  it("never exposes a supplier name in source, assets or tests", () => {
    const everything = [...files("src"), ...files("public"), ...files("tests")].filter((f) => f !== TERMS_FILE);
    const hits = everything.filter((f) => {
      const haystack = `${f}\n${/\.(tsx?|css|json|svg|md)$/.test(f) ? readFileSync(f, "utf8") : ""}`.toLowerCase();
      return INTERNAL.some((t) => haystack.includes(t.toLowerCase()));
    });
    expect(hits).toEqual([]);
  });
});
