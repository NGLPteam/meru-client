import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const host = (await headers()).get("host");
  if (
    process.env.NODE_ENV === "production" &&
    (await headers()).get("x-forwarded-proto") !== "https" &&
    !host?.includes("localhost")
  ) {
    return NextResponse.redirect(
      `https://${host}${request.nextUrl.pathname}`,
      301,
    );
  }

  const pathname = request.nextUrl.pathname;

  // Because we need runtime env vars, we need to avoid generating any pages at
  // buildtime. This (or any) top-level dyanmic segment ensures we opt all
  // routes out of Next's buildtime generation.
  return NextResponse.rewrite(new URL(`/dynamic${pathname}`, request.url));
}
