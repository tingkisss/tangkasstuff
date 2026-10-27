import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// Helper fungsi untuk hash password SHA-256 (bawaan Node.js, tanpa butuh npm i)
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    // Query ke tabel admins
    const res = await query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username]);
    const rows = Array.isArray(res) ? res : (res?.rows || []);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah!' }, { status: 401 });
    }

    const admin = rows[0];
    const inputHash = hashPassword(password);

    if (admin.password_hash !== inputHash) {
      return NextResponse.json({ error: 'Username atau password salah!' }, { status: 401 });
    }

    // Return data admin jika berhasil login
    return NextResponse.json({ 
      success: true, 
      admin: { id: admin.id, username: admin.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}