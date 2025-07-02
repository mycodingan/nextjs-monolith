import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET: Ambil semua user (untuk admin)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ADMIN MANAGE - GET request received');
    
    // Check for bypass parameter
    const isDevelopment = process.env.NODE_ENV === 'development';
    const bypassToken = isDevelopment && request.nextUrl.searchParams.get('bypass') === 'true';
    
    if (!bypassToken) {
      const admin = await requireAdmin(request);
      if (admin instanceof NextResponse) {
        console.log('❌ Admin authentication failed');
        return admin;
      }
      console.log('✅ Admin authenticated:', admin.email);
    } else {
      console.log('🔓 Bypass enabled - skipping authentication');
    }

    const users = await query('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC') as any[];
    console.log('✅ Users fetched:', users.length);
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('❌ Error in admin GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create user baru (untuk admin)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 ADMIN MANAGE - POST request received');
    
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) {
      console.log('❌ Admin authentication failed');
      return admin;
    }

    console.log('✅ Admin authenticated:', admin.email);

    const { name, email, password, role } = await request.json();
    
    console.log('📝 Creating user:', { name, email, role });

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Cek email sudah ada
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, role]);
    
    console.log('✅ User created successfully');
    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('❌ Error in admin POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update user (untuk admin)
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 ADMIN MANAGE - PUT request received');
    
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) {
      console.log('❌ Admin authentication failed');
      return admin;
    }

    console.log('✅ Admin authenticated:', admin.email);

    const { userId, name, email, password, role } = await request.json();
    
    console.log('📝 Updating user:', { userId, name, email, role });

    if (!userId || !name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update password jika diisi
    if (password && password.length > 0) {
      const hashed = await bcrypt.hash(password, 10);
      await query('UPDATE users SET name=?, email=?, password=?, role=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [name, email, hashed, role, userId]);
    } else {
      await query('UPDATE users SET name=?, email=?, role=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [name, email, role, userId]);
    }
    
    console.log('✅ User updated successfully');
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('❌ Error in admin PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus user (untuk admin)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 ADMIN MANAGE - DELETE request received');
    
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) {
      console.log('❌ Admin authentication failed');
      return admin;
    }

    console.log('✅ Admin authenticated:', admin.email);

    const { userId } = await request.json();
    
    console.log('🗑️ Deleting user:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    await query('DELETE FROM users WHERE id=?', [userId]);
    
    console.log('✅ User deleted successfully');
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error in admin DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 