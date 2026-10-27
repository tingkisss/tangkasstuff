export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 

export async function GET() {
  try {
    const res = await query('SELECT jpy_rate, jastip_fee FROM settings WHERE id = 1');
    
    // Fleksibel: Mendukung balikan Array langsung (Neon HTTP) maupun res.rows (pg pool)
    const rows = Array.isArray(res) ? res : (res?.rows || []);

    if (rows.length > 0) {
      return NextResponse.json({
        jpy_rate: Number(rows[0].jpy_rate),
        jastip_fee: Number(rows[0].jastip_fee),
      });
    }
    
    return NextResponse.json({ jpy_rate: 125, jastip_fee: 22000 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { jpy_rate, jastip_fee, admin_id } = await req.json();
    
    await query(
      `INSERT INTO settings (id, jpy_rate, jastip_fee, updated_by)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE 
       SET jpy_rate = EXCLUDED.jpy_rate, 
           jastip_fee = EXCLUDED.jastip_fee, 
           updated_at = CURRENT_TIMESTAMP, 
           updated_by = EXCLUDED.updated_by`,
      [jpy_rate, jastip_fee, admin_id || 1]
    );
    
    return NextResponse.json({ success: true, message: 'Kurs dan Fee berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}