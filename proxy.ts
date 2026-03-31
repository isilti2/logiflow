import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-please-change-in-production-32c'
);

// Routes that require authentication
const PROTECTED = [
  '/dashboard', '/depolama', '/profil', '/takim', '/api-keys',
  '/opt-gecmisi', '/admin', '/features/kargo-optimizasyon',
  '/features/detayli-raporlama', '/features/yonetme-depolama',
  '/features/yuk-plani-paylasimi',
];

// Routes that redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('lf_session')?.value;

  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      session = payload;
    } catch { /* invalid/expired token */ }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
