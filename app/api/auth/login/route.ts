import { NextResponse } from 'next/server';
import { loginAction } from '@/app/actions/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const error = await loginAction(email, password);
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ ok: true });
}
