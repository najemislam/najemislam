import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'default-secret-key-123456'
);

const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/community-guidelines',
  '/favicon.ico',
  '/manifest.json',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/session',
  '/api/auth/logout',
  '/api/auth/guest',
];

// Paths that guests (unauthenticated read-only viewers) are allowed to visit
const guestAllowedPaths = [
  '/home',
  '/search',
  '/about',
  '/connect',
  '/alerts',
  '/profile',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths and static files
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('sb-auth-token')?.value;
  const guestMode = req.cookies.get('guest_mode')?.value;

  // Allow guests to browse read-only pages
  if (!token && guestMode === 'true') {
    const isGuestAllowed =
      guestAllowedPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
      pathname.startsWith('/user/');
    if (isGuestAllowed) {
      return NextResponse.next();
    }
    // Guests trying to access write-only areas get redirected home
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to landing page
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.delete('sb-auth-token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
