import { NextResponse, type NextRequest } from "next/server";

import { getRequestAuthSession } from "@/services/auth/session";

const PUBLIC_ROUTES = ["/login"];
const PROTECTED_ROUTES = ["/dashboard", "/clientes", "/cotizaciones"];

function startsWithOneOf(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const user = getRequestAuthSession(request);
  const isPublicRoute = startsWithOneOf(pathname, PUBLIC_ROUTES);
  const isProtectedRoute = startsWithOneOf(pathname, PROTECTED_ROUTES);

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};