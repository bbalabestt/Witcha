/** Copy v5.3 §9, as written. It has no row for Recipes or FAQ: titles follow its pattern, and Recipes reuses §1's line. */
export const SEO = {
  home: {
    title: "WITCHA MATCHA | Japanese Matcha & Hojicha",
    description: "Four Japanese teas with distinct flavour profiles, from creamy, umami-rich matcha to deeply roasted hojicha. Compare tasting notes and find your next cup.",
  },
  teas: {
    title: "Japanese Matcha & Hojicha | WITCHA MATCHA",
    description: "Shop Yame matcha, a Japanese matcha blend, Kagoshima matcha and Uji hojicha. Compare tasting notes and find the tea that suits how you drink it.",
  },
  academy: {
    title: "Witcha Academy | WITCHA MATCHA",
    description: "Witcha Academy is where WITCHA MATCHA explores tea by taste. Meet the four teas and the character behind each Academy title.",
  },
  contact: {
    title: "Contact Us | WITCHA MATCHA",
    description: "Have a question about WITCHA MATCHA, our teas or an order? Get in touch with our team.",
  },
  recipes: {
    title: "Recipes | WITCHA MATCHA",
    description: "Start with a recipe, then make it your own. Find the measurements and steps for your next cup, straight or with milk.",
  },
  faq: {
    title: "FAQ | WITCHA MATCHA",
  },
} as const;

export function brandTitle(title: string): string {
  return `${title} | WITCHA MATCHA`;
}
