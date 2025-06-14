import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Allow access to auth pages and API routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token, redirect to sign in
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protect all routes except auth pages, API auth routes, and static files
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
