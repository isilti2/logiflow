import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db';

const ACCESS_COOKIE  = 'lf_session';
const REFRESH_COOKIE = 'lf_refresh';

const ACCESS_TTL_S  = 60 * 60;          // 1 saat
const REFRESH_TTL_S = 60 * 60 * 24 * 7; // 7 gün

const secret = () => new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-please-change-in-production-32c'
);

export interface SessionPayload {
  userId: string;
  email:  string;
  role:   string;
}

/* ─── Yardımcılar ─────────────────────────────────────────────── */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function signAccess(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_S}s`)
    .sign(secret());
}

/* ─── Session Oluştur ─────────────────────────────────────────── */
export async function createSession(payload: SessionPayload) {
  const [accessToken, rawRefresh] = await Promise.all([
    signAccess(payload),
    Promise.resolve(crypto.randomBytes(40).toString('hex')),
  ]);

  // Refresh token'ı DB'ye kaydet (hash olarak)
  const expiresAt = new Date(Date.now() + REFRESH_TTL_S * 1000);
  await db.refreshToken.create({
    data: { userId: payload.userId, tokenHash: hashToken(rawRefresh), expiresAt },
  });

  const store = await cookies();
  const baseOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path:     '/',
  };

  store.set(ACCESS_COOKIE,  accessToken, { ...baseOpts, maxAge: ACCESS_TTL_S });
  store.set(REFRESH_COOKIE, rawRefresh,  { ...baseOpts, maxAge: REFRESH_TTL_S });
}

/* ─── Session Oku (access → refresh fallback) ─────────────────── */
export async function getSession(): Promise<SessionPayload | null> {
  const store  = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  // 1. Access token geçerli mi?
  if (access) {
    try {
      const { payload } = await jwtVerify(access, secret());
      return payload as unknown as SessionPayload;
    } catch {
      // Süresi dolmuş veya geçersiz — refresh'e dön
    }
  }

  // 2. Refresh token ile yenile
  const rawRefresh = store.get(REFRESH_COOKIE)?.value;
  if (!rawRefresh) return null;

  const record = await db.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawRefresh) },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    // Geçersiz/süresi dolmuş refresh — temizle
    if (record) await db.refreshToken.delete({ where: { id: record.id } });
    return null;
  }

  // Yeni access token yayınla (refresh token rotasyonu yok — sadelik için)
  const sessionPayload: SessionPayload = {
    userId: record.user.id,
    email:  record.user.email,
    role:   record.user.role,
  };
  const newAccess = await signAccess(sessionPayload);
  store.set(ACCESS_COOKIE, newAccess, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   ACCESS_TTL_S,
    path:     '/',
  });

  return sessionPayload;
}

/* ─── Session Sil ─────────────────────────────────────────────── */
export async function destroySession() {
  const store      = await cookies();
  const rawRefresh = store.get(REFRESH_COOKIE)?.value;

  // DB'den refresh token'ı sil
  if (rawRefresh) {
    await db.refreshToken.deleteMany({ where: { tokenHash: hashToken(rawRefresh) } });
  }

  const baseOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge:   0,
    path:     '/',
  };
  store.set(ACCESS_COOKIE,  '', baseOpts);
  store.set(REFRESH_COOKIE, '', baseOpts);
}

/* ─── Eski refresh token'ları temizle (cron için) ─────────────── */
export async function pruneExpiredRefreshTokens() {
  await db.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
