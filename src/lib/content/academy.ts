import type { TeaType } from "@/lib/data/types";

/** Copy v5.3 §5, as written. */
export const ACADEMY_TITLES: Array<{ handle: string; name: string; character: string; line: string; tea: TeaType }> = [
  { handle: "the-professor-yame-matcha", name: "The Professor — Yame Matcha", character: "Depth and umami", line: "Smooth, layered and at its best on its own.", tea: "matcha" },
  { handle: "the-scholar-japanese-matcha-blend", name: "The Scholar — Japanese Matcha Blend", character: "Balance", line: "Easygoing and dependable in a daily latte.", tea: "matcha" },
  { handle: "the-rebel-kagoshima-matcha", name: "The Rebel — Kagoshima Matcha", character: "Bold nuttiness", line: "For anyone who's found matcha too green.", tea: "matcha" },
  { handle: "the-librarian-uji-hojicha", name: "The Librarian — Uji Hojicha", character: "Roasted warmth", line: "Hojicha: smoky, toasty and comforting.", tea: "hojicha" },
];
