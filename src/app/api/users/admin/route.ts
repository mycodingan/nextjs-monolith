import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

// GET: Ambil semua user
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const users = await query('SELECT id, name, email, role, created_at, updated_at FROM users');
  return NextResponse.json({ users });
}

// POST: Create user baru
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { name, email, password, role } = await request.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Cek email sudah ada
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, role]);
  return NextResponse.json({ message: 'User created' });
}

// PUT: Update user
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { userId, name, email, password, role } = await request.json();
  if (!userId || !name || !email || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Update password jika diisi
  if (password && password.length > 0) {
    const hashed = await bcrypt.hash(password, 10);
    await query('UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?', [name, email, hashed, role, userId]);
  } else {
    await query('UPDATE users SET name=?, email=?, role=? WHERE id=?', [name, email, role, userId]);
  }
  return NextResponse.json({ message: 'User updated' });
}

// DELETE: Hapus user
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  await query('DELETE FROM users WHERE id=?', [userId]);
  return NextResponse.json({ message: 'User deleted' });
} 