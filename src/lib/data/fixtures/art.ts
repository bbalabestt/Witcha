import type { Image } from "../types";

/**
 * Packaging and painting concepts supplied with Prototype V4 (`public/art`). Origin and licence to be confirmed
 * before launch (docs/DEVIATIONS.md D-14); the Dreamer (05) is still a concept and is labelled as one.
 */
const SIZES: Record<string, [number, number]> = {
  tin: [720, 720],
  key: [820, 820],
  article: [960, 640],
  hero: [1800, 900],
};

function img(file: string, size: keyof typeof SIZES, alt: string): Image {
  const [width, height] = SIZES[size]!;
  return { url: `/art/${file}`, alt, width, height };
}

export const ART = {
  professorTin: img("01-professor-tin-mockup.webp", "tin", "The Professor tin, Witcha Matcha packaging concept."),
  professorKey: img(
    "01-professor-key-visual.webp",
    "key",
    "The Professor, a silver-grey cat with a gold scholar brooch, beside a matcha bowl at an arched library window.",
  ),
  charmerTin: img("02-charmer-tin-mockup.webp", "tin", "The Charmer tin, Witcha Matcha packaging concept."),
  charmerKey: img(
    "02-charmer-key-visual.webp",
    "key",
    "The Charmer, a warm taupe cat with a teal satchel, beside an iced matcha latte in a conservatory.",
  ),
  hojichaTin: img("03-organic-hojicha-tin-mockup.webp", "tin", "Organic Hojicha tin, Witcha Matcha packaging concept."),
  hojichaKey: img(
    "03-organic-hojicha-key-visual.webp",
    "key",
    "The tea-room keeper, a chocolate-brown cat with a cream scarf, beside a hojicha latte.",
  ),
  kosenTin: img("04-kosen-daily-matcha-tin-mockup.webp", "tin", "Kosen Daily Matcha tin, Witcha Matcha packaging concept."),
  kosenKey: img(
    "04-kosen-daily-matcha-key-visual.webp",
    "key",
    "The Kosen keeper, a ginger-and-ivory cat with a blue neckerchief, at an arched kitchen window.",
  ),
  dreamerTin: img("05-fifth-sku-concept-tin-mockup.webp", "tin", "The Dreamer tin, a fifth tea concept."),
  dreamerKey: img(
    "05-fifth-sku-concept-key-visual.webp",
    "key",
    "The Dreamer, a cream-and-blush cat with a blue leaf pin, beside an iced matcha in a garden window.",
  ),
  whisking: img("articles-01-the-art-of-whisking.jpg", "article", "Matcha whisked pure in a blue ceramic bowl."),
  iced: img("articles-02-an-iced-matcha-moment.jpg", "article", "An iced matcha latte poured over ice in a tall glass."),
  hojichaLatte: img("articles-03-a-cosy-hojicha-latte.jpg", "article", "A cosy hojicha latte in a ceramic cup."),
  garden: img(
    "heroes-01-academy-garden-desktop.jpg",
    "hero",
    "Five painted cats gather around matcha and hojicha in a blue garden conservatory.",
  ),
  everyday: img(
    "heroes-02-everyday-matcha-desktop.jpg",
    "hero",
    "The Professor and Charmer sit by matcha bowls, an iced latte and bamboo tools in morning window light.",
  ),
} as const;
