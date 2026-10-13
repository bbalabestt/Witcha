import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/server/security-headers.mjs";

const dev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ dev }) }];
  },
};

export default nextConfig;
