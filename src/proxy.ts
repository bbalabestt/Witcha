import { NextResponse, type NextRequest } from "next/server";
import { isPreviewAuthorised } from "@/lib/http/preview-gate";

export function proxy(request: NextRequest) {
  if (isPreviewAuthorised(request.headers.get("authorization"), process.env.PREVIEW_PASSWORD)) return NextResponse.next();
  return new NextResponse("Preview", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="WITCHA MATCHA preview"' } });
}

// Shopify webhooks must still reach revalidation.
export const config = { matcher: "/((?!api/revalidate|_next/static|icon.svg).*)" };
