export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 1. GET: Ambil Detail Produk
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await query('SELECT * FROM products WHERE id = $1', [params.id]);
    const rows = Array.isArray(res) ? res : (res?.rows || []);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// 2. PUT: Update Status Stok / Data Produk
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stock_status, price, name } = body;

    // Jika update status stok instan
    if (stock_status && !name) {
      const res = await query(
        `UPDATE products 
         SET stock_status = $1 
         WHERE id = $2 
         RETURNING *`,
        [stock_status, params.id]
      );
      const rows = Array.isArray(res) ? res : (res?.rows || []);
      return NextResponse.json({ success: true, product: rows[0] });
    }

    // Jika update data lengkap
    const res = await query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           stock_status = COALESCE($3, stock_status)
       WHERE id = $4 
       RETURNING *`,
      [name, price, stock_status, params.id]
    );

    const rows = Array.isArray(res) ? res : (res?.rows || []);
    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}

// 3. DELETE: Hapus Produk
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM products WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}