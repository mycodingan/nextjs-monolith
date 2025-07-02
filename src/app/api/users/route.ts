import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'USER' } = body;

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru (tanpa mengisi id karena AUTO_INCREMENT)
    await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Ambil user yang baru dibuat (tanpa password) berdasarkan email
    const newUser = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 