'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

interface InvitePayload {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedAt: string;
  exp: number;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editör',
  viewer: 'Görüntüleyici',
};

type State = 'loading' | 'valid' | 'expired' | 'invalid' | 'accepted';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [payload, setPayload] = useState<InvitePayload | null>(null);

  useEffect(() => {
    try {
      const raw = Array.isArray(params.token) ? params.token[0] : params.token;
      if (!raw) { setState('invalid'); return; }
      const json = decodeURIComponent(atob(raw));
      const data = JSON.parse(json) as InvitePayload;
      if (!data.email || !data.role || !data.exp) { setState('invalid'); return; }
      if (Date.now() > data.exp) { setState('expired'); return; }
      setPayload(data);
      setState('valid');
    } catch {
      setState('invalid');
    }
  }, [params.token]);

  async function handleAccept() {
    if (!payload) return;
    // Check if user already has an account
    const meRes = await fetch('/api/auth/me');
    if (meRes.ok) {
      // Already logged in — just mark accepted and redirect to dashboard
      setState('accepted');
      return;
    }
    // Not logged in — redirect to register with email pre-filled
    router.push(`/register?email=${encodeURIComponent(payload.email)}`);
  }

  if (state === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (state === 'invalid' || state === 'expired') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center space-y-4">
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
          {state === 'expired' ? <Clock className="w-7 h-7 text-orange-500" /> : <AlertTriangle className="w-7 h-7 text-orange-500" />}
        </div>
        <h1 className="text-xl font-black text-gray-900">
          {state === 'expired' ? 'Davet Süresi Doldu' : 'Geçersiz Davet Linki'}
        </h1>
        <p className="text-gray-500 text-sm">
          {state === 'expired'
            ? 'Bu davet linki 7 gün geçerliydi ve süresi doldu. Yeni bir davet linki isteyin.'
            : 'Bu davet linki geçersiz veya bozuk. Lütfen gönderilen linki doğrudan yapıştırın.'}
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  if (state === 'accepted') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center space-y-4">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Takıma Katıldınız!</h1>
        <p className="text-gray-500 text-sm">
          <span className="font-semibold text-gray-700">{payload?.email}</span> adresiyle{' '}
          <span className="font-semibold text-blue-600">{ROLE_LABEL[payload?.role ?? 'viewer']}</span> rolüyle
          LogiFlow takımına eklendiniz.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Giriş Yap <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  // valid
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center space-y-5">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white font-black text-xs">LF</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Logi<span className="text-blue-600">Flow</span>
          </span>
        </div>

        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="w-7 h-7 text-blue-600" />
        </div>

        <div>
          <h1 className="text-xl font-black text-gray-900 mb-1">Takım Daveti</h1>
          <p className="text-gray-500 text-sm">
            LogiFlow takımına katılmaya davet edildiniz.
          </p>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">E-posta</span>
            <span className="font-semibold text-gray-700">{payload?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Rol</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
              {ROLE_LABEL[payload?.role ?? 'viewer']}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Geçerlilik</span>
            <span className="text-gray-600 text-xs">
              {new Date(payload?.exp ?? 0).toLocaleDateString('tr-TR')} tarihine kadar
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Daveti Kabul Et
          </button>
          <Link href="/" className="text-xs text-center text-gray-400 hover:text-gray-600 transition-colors">
            Reddet
          </Link>
        </div>
      </div>
    </div>
  );
}
