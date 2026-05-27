import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define which paths require which modules
const moduleRoutes: Record<string, string[]> = {
  '/dashboard/audit': ['google_ranking_agent'],
  '/dashboard/content': ['content_studio'],
  '/dashboard/reviews': ['reputation_agent'],
  '/dashboard/crm': ['sales_agent'], // Lead manager
  '/dashboard/campaigns': ['marketing_automation'],
  '/dashboard/upload': ['marketing_automation', 'reputation_agent'],
  '/dashboard/posts': ['content_studio', 'marketing_automation'],
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = path.startsWith('/dashboard');
  const token = request.cookies.get('auth_token')?.value;

  // Protect dashboard routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
      const { payload } = await jwtVerify(token, secret);
      
      const activeModules = (payload.activeModules as string[]) || [];
      const onboardingCompleted = payload.onboardingCompleted as boolean;

      // Force onboarding
      if (!onboardingCompleted && path !== '/dashboard/onboarding') {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url));
      }

      // Check module access
      const requiredModules = moduleRoutes[path];
      if (requiredModules) {
        const hasAccess = requiredModules.some(m => activeModules.includes(m));
        if (!hasAccess) {
          // Redirect to an upgrade/locked page
          return NextResponse.redirect(new URL('/dashboard/upgrade?module=' + requiredModules[0], request.url));
        }
      }

    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
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
