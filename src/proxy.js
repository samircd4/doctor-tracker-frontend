/**
 * proxy.js  (Next.js 16 name for "middleware")
 * Runs before every page request and guards the app:
 * - No login cookie  → redirect to /login
 * - Logged in user visiting /login → redirect to /dashboard
 *
 * This is only a quick check that the cookie exists. The real security check
 * (verifying the token) happens on the Express API for every request.
 */
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = Boolean(request.cookies.get("token")?.value);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search); // come back here after login
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Run on pages only — skip API calls, Next.js internals and static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
