/** Decoupled signals for the pixel familiar, so commerce code does not import the cat. */
export type FamiliarEvent = { type: "added" } | { type: "say"; text: string; ms?: number };

const EVENT = "wm:familiar";

export function emitFamiliar(event: FamiliarEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FamiliarEvent>(EVENT, { detail: event }));
}

export function onFamiliar(handler: (event: FamiliarEvent) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<FamiliarEvent>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
