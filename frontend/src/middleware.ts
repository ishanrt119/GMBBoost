import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware only handles the root redirect.
// Auth protection is handled client-side in dashboard/layout.tsx
// because the token lives in localStorage (not cookies).
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
