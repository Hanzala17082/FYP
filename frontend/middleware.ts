import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Allow all page requests through. Auth and redirects are handled client-side
 * so that pages always load and users are not blocked from "opening" any URL.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
