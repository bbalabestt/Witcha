/**
 * Allow-list sanitiser for HTML from Shopify (article bodies, policies). Shopify content is admin-authored, but
 * it is still sanitised before rendering: only basic text elements survive, every attribute is dropped except
 * `href` on links (http, https, mailto or relative), and scripts, styles and event handlers are removed.
 */
const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "a", "span"]);

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, rawName: string, attrs: string) => {
      const name = rawName.toLowerCase();
      if (!ALLOWED.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name === "a") {
        const href = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
        const url = (href?.[1] ?? href?.[2] ?? "").trim();
        const safe = /^(https?:|mailto:|\/(?!\/)|#)/i.test(url) ? url.replace(/"/g, "&quot;") : "";
        return safe ? `<a href="${safe}" rel="noopener">` : "<a>";
      }
      return `<${name}>`;
    });
}
