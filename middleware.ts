import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Redirect admin domains from / to /admin
  if (
    (host.startsWith("admin.mspace.social") ||
      host.startsWith("admin.xingyuspace.com")) &&
    url.pathname === "/"
  ) {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};