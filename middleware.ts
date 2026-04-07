import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_COOKIE  = 'lf_session';
const PROTECTED_PREFIXES = ['/dashboard', '/muhasebe', '/konum', '/sofor', '/depolama', '/profil', '/takim', '/api-keys', '/admin', '/opt-gecmisi', '/fatura'];
const API_PUBLIC = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/refresh'];

const secret = () => new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-please-change-in-production-32c'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Kamuya açık API endpointleri geç
  if (API_PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  const isProtectedPage = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isProtectedApi  = pathname.startsWith('/api/') && !API_PUBLIC.some(p => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const access = req.cookies.get(ACCESS_COOKIE)?.value;

  // Access token geçerliyse geç
  if (access) {
    try {
      await jwtVerify(access, secret());
      return NextResponse.next();
    } catch {
      // Süresi dolmuş — refresh endpoint'e yönlendir veya 401 dön
    }
  }

  // API isteği: 401 dön (istemci /api/auth/refresh çağırır)
  if (isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized', refresh: true }, { status: 401 });
  }

  // Sayfa isteği: login'e yönlendir
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
