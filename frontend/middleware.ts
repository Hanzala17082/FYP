import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/admin/login',
  '/register',
  '/forgot-password',
  '/trips',
  '/agencies',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Allow trip detail pages (public)
  if (pathname.startsWith('/trips/') && pathname !== '/trips') {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token and trying to access protected route, allow through
  // (client-side will handle redirect)
  if (!token) {
    return NextResponse.next()
  }

  // Try to get user role from cookie (set by client after login)
  const userRole = request.cookies.get('userRole')?.value

  // If accessing admin routes (but exclude /admin/login which is public)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (userRole !== 'Admin') {
      // Redirect based on role or to login
      const redirectUrl = new URL(
        userRole === 'Agency' ? '/dashboard' : 
        userRole === 'Traveler' ? '/dashboard' : 
        '/login',
        request.url
      )
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If accessing agency routes
  if (pathname.startsWith('/agency')) {
    if (userRole !== 'Agency') {
      const redirectUrl = new URL(
        userRole === 'Admin' ? '/admin/dashboard' : 
        userRole === 'Traveler' ? '/dashboard' : 
        '/login',
        request.url
      )
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If accessing traveler routes
  if (pathname.startsWith('/traveler')) {
    if (userRole !== 'Traveler') {
      const redirectUrl = new URL(
        userRole === 'Admin' ? '/admin/dashboard' : 
        userRole === 'Agency' ? '/dashboard' : 
        '/login',
        request.url
      )
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
