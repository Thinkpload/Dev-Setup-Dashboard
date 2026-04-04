import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRateLimit } from './lib/rate-limit';

const PROTECTED_PATHS = ['/dashboard'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];

const apiRateLimit = createRateLimit({ limit: 100, window: '1 m' });

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes first
  if (pathname.startsWith('/api')) {
    const { success } = await apiRateLimit(request);
    if (!success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    return NextResponse.next();
  }

  // Auth guard
  const sessionToken = request.cookies.get('better-auth.session_token');

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !sessionToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (AUTH_PATHS.includes(pathname) && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
