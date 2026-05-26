import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const isPublicRoute =
    pathname === "/login" || pathname === "/register" || pathname === "/";

  if (isPublicRoute) {
    if (token && userRole) {
      const redirectPath =
        userRole === "borrower" ? "/borrower/dashboard" : `/${userRole}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const roleRoutes: Record<string, string[]> = {
    borrower: ["/borrower"],
    sales: ["/sales"],
    sanction: ["/sanction"],
    disbursement: ["/disbursement"],
    collection: ["/collection"],
    admin: [
      "/admin",
      "/sales",
      "/sanction",
      "/disbursement",
      "/collection",
      "/borrower",
    ],
  };

  const allowedRoutes = roleRoutes[userRole as any] || [];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed && userRole !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/borrower/:path*",
    "/sales/:path*",
    "/sanction/:path*",
    "/disbursement/:path*",
    "/collection/:path*",
    "/admin/:path*",
  ],
};
