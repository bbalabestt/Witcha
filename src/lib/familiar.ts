/**
 * Tiny event channel for the pixel familiar (the Academy cat). Anything can make it speak or run
 * toward the cart without importing the component.
 */
export type FamiliarCue = { say?: string; ms?: number; run?: "cart" };

const EVENT = "wm:familiar";

export function cueFamiliar(cue: FamiliarCue): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FamiliarCue>(EVENT, { detail: cue }));
}

export function onFamiliarCue(handler: (cue: FamiliarCue) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<FamiliarCue>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** What the cat says when tapped (Prototype V2). */
export const FAMILIAR_LINES = ["Which matcha today?", "Matcha, with taste.", "Mrrp. Try the deep one.", "Two grams. Whisk. Bliss."] as const;

export const FAMILIAR_HIDDEN_KEY = "wm-familiar-hidden";

/** 16×12 sprites from Prototype V2: b = body, e = eye, p = nose, . = clear. */
export const FAMILIAR_SPRITES = {
  walkA: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", ".b........bebeb.", "b.........bbpbb.", "b...bbbbbbbbbb..", ".b.bbbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbb...", "..bb.b....b.bb..", "..b..b....b..b..", ".bb.bb...bb.bb.."],
  walkB: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "b.........bebeb.", "b.........bbpbb.", ".b..bbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbb...", "...bb.b..bb.b...", "...b..b..b..b...", "..bb.bb.bb.bb..."],
  sit: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "..........bebeb.", "..........bbpbb.", ".........bbbbbb.", "........bbbbbbb.", "..b.....bbbbbbb.", ".b.....bbbbbbbb.", ".b....bbbbbbbbb.", "..bbbbbbbbbbbbb.", "....bbbb.bb.bb.."],
  blink: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "..........bbbbb.", "..........bbpbb.", ".........bbbbbb.", "........bbbbbbb.", "..b.....bbbbbbb.", ".b.....bbbbbbbb.", ".b....bbbbbbbbb.", "..bbbbbbbbbbbbb.", "....bbbb.bb.bb.."],
} as const;

export type SpriteName = keyof typeof FAMILIAR_SPRITES;
