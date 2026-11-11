/**
 * Built but not public until the founders confirm (VENDOR-FIX-LIST "Hide", copy v5.3 `[confirm]`).
 * A false flag removes the block, its links and its sitemap entry. Never replace it with a placeholder.
 */
export const LIVE = {
  announcementBar: false,
  gifts: false,
  accessories: false,
  guides: false,
  ourStory: false,
  shippingReturns: false,
  contact: false,
  paymentBadges: false,
  productReviews: false,
  policies: false,
  newsletter: false,
  backInStock: false,
  academyCat: false,
} as const;

export const CONFIRMED = {
  rebelTastingWords: false,
  /** Detail line, cultivar and harvest. */
  rebelDetails: false,
  hojichaIngredients: false,
  storage: false,
  cupsPerTin: false,
  hojichaLatte: false,
  scholarStrongDose: false,
} as const;
