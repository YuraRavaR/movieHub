import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/search', '/watchlist'];
const AUTH_PAGES = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = Boolean(request.cookies.get('auth_token')?.value);

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));

  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/search';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/search/:path*', '/watchlist/:path*', '/login', '/signup'],
};
