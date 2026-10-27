import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const validToken = process.env.ADMIN_API_TOKEN;

    if (token && token === validToken) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Token admin tidak valid!' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}