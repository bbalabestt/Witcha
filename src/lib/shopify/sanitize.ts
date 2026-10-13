import sanitizeHtml from "sanitize-html";

/** Allow-list for merchant HTML (descriptions, articles, pages, policies). No scripts, styles or event handlers. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "a", "span", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption", "hr"],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "width", "height", "loading"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  // An image whose src was stripped (e.g. http:) would render as an empty box.
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  transformTags: {
    // Merchant headings start at h2: the page owns h1.
    h1: "h2",
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return { tagName, attribs: external ? { ...attribs, rel: "noopener noreferrer", target: "_blank" } : attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

export function sanitizeMerchantHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
