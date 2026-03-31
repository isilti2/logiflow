'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (res.status === 401) {
        router.replace('/login');
      } else {
        setAuthed(true);
      }
    }).catch(() => router.replace('/login'));
  }, [router]);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
