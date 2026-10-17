import type { SocialReviews } from "./index";

/**
 * SAMPLE DATA from Prototype V4. Invented for the client demo, never real customers. Only served when
 * `REVIEWS_SOURCE=sample`, which `env.ts` refuses with live Shopify data in production, and every surface
 * that renders it shows a SAMPLE DATA tag.
 */
const rows: Array<[string, "google" | "facebook", number | null, string, string, string, string | null]> = [
  ["Mia L.", "google", 5, "2 weeks ago", "The Professor tin is the prettiest thing on my bench, and the tea is just as lovely. Smooth, nutty, no bitterness when I whisk it properly.", "Yame no Mukashi", "articles-01-the-art-of-whisking.jpg"],
  ["Tom R.", "facebook", null, "3 weeks ago", "Ordered the Kosen for iced lattes. Arrived in two days to Brunswick with a handwritten note. Tastes clean and toasty with oat milk.", "Kosen Daily Matcha", null],
  ["Priya S.", "google", 5, "1 month ago", "Finally a matcha site that tells me how it tastes before I buy. The bright to deep scale made choosing easy.", "The Charmer", null],
  ["Jess W.", "facebook", null, "1 month ago", "Bought the discovery set as a birthday gift. Packing slip had no prices, just the gift note. My sister loved the cats.", "Discovery Set", "heroes-02-everyday-matcha-desktop.jpg"],
  ["Daniel K.", "google", 4, "1 month ago", "Lovely deep flavour as a latte. I wish there was a bigger tin, but I will keep reordering.", "The Charmer", null],
  ["Hannah B.", "google", 5, "2 months ago", "The hojicha latte recipe on the site is now my evening ritual. Cosy, chocolatey and not too sweet.", "Organic Hojicha", "articles-03-a-cosy-hojicha-latte.jpg"],
  ["Chris N.", "facebook", null, "2 months ago", "Friendly replies on Messenger when I asked about whisking water temperature. Small brand, real people.", "Yame no Mukashi", null],
  ["Aiko T.", "google", 5, "2 months ago", "Proper first harvest taste, vivid colour in the bowl. Reminds me of tea at my grandmother’s in Fukuoka.", "Yame no Mukashi", "articles-02-an-iced-matcha-moment.jpg"],
];

export const SAMPLE_SOCIAL_REVIEWS: SocialReviews = {
  google: { rating: 4.9, count: 128 },
  facebook: { recommendPercent: 96, count: 64 },
  sample: true,
  reviews: rows.map(([author, source, rating, date, text, tea, photo], i) => ({
    id: `sample-${i}`,
    source,
    author,
    date,
    rating,
    text,
    tea,
    photo: photo ? { url: `/art/${photo}`, alt: `Customer photo: ${tea}` } : null,
  })),
};
