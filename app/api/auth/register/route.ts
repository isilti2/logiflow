import { NextResponse } from 'next/server';
import { registerAction } from '@/app/actions/auth';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const error = await registerAction(email, password, name ?? '');
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
