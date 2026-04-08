import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-please-change-in-production-32c'
);

const ACCESS_COOKIE = 'lf_session';

// Oturum gerektiren sayfalar
const PROTECTED_PAGES = [
  '/dashboard', '/muhasebe', '/konum', '/sofor', '/depolama',
  '/profil', '/takim', '/api-keys', '/admin', '/opt-gecmisi', '/fatura',
];

// Oturum açıksa dashboard'a yönlendir
const AUTH_ROUTES = ['/login', '/register'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE)?.value;

  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      session = payload;
    } catch { /* süresi dolmuş veya geçersiz */ }
  }

  const isProtected = PROTECTED_PAGES.some((p) => pathname.startsWith(p));
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // Korumalı sayfaya oturumsuz erişim → login'e yönlendir
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Login/register'a oturumla erişim → dashboard'a yönlendir
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
