import { NextResponse, type NextRequest } from "next/server";

/**
 * Waitlist mode (`NEXT_PUBLIC_SITE_MODE=waitlist`): every storefront URL shows /coming-soon.
 * Assets, API routes and metadata files pass through.
 */
export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_MODE !== "waitlist") return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname === "/coming-soon") return NextResponse.next();
  return NextResponse.rewrite(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next/|api/|logos/|favicon.ico|robots.txt|sitemap.xml|opengraph-image).*)"],
};
