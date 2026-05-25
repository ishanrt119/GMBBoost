import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public routes that do not require authentication
  const isPublicRoute = path === '/' || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/verify') || path.startsWith('/api/auth') || path.startsWith('/api/inngest') || path.startsWith('/api/webhook');
  const isProtectedRoute = path.startsWith('/dashboard');
  
  const token = request.cookies.get('auth_token')?.value;

  // Protect dashboard routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent logged-in users from accessing login/register pages
  if ((path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/verify')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
