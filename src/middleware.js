import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route Protection & Role Authorization Middleware
 * 
 * Rules:
 * - Unauthenticated users attempting to access /dashboard/* are redirected to /login
 * - Organizers cannot access /dashboard/volunteer/* (redirected to /dashboard/organizer)
 * - Volunteers cannot access /dashboard/organizer/* (redirected to /dashboard/volunteer)
 * - Direct visits to /dashboard route automatically to the user's role-specific space
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Retrieve decoded JWT session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/dashboard")) {
    // 1. If not logged in, redirect to login with callbackUrl
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role;

    // 2. Direct visit to /dashboard -> route to respective role dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const target = userRole === "organizer" ? "/dashboard/organizer" : "/dashboard/volunteer";
      return NextResponse.redirect(new URL(target, req.url));
    }

    // 3. Organizer cannot access volunteer dashboard
    if (pathname.startsWith("/dashboard/volunteer") && userRole !== "volunteer") {
      return NextResponse.redirect(new URL("/dashboard/organizer", req.url));
    }

    // 4. Volunteer cannot access organizer dashboard
    if (pathname.startsWith("/dashboard/organizer") && userRole !== "organizer") {
      return NextResponse.redirect(new URL("/dashboard/volunteer", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
