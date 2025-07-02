import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireAuth, AuthenticatedUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users/manage - Get user profile (requires authentication)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;

    // Get user profile
    const userProfile = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [user.userId]
    ) as any[];

    if (userProfile.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: userProfile[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/manage - Update user profile (requires authentication)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // Validasi input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan user lain
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, user.userId]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Update user data
    let updateQuery = 'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    let updateParams = [name, email, user.userId];

    // Jika ada password baru, verifikasi password lama dulu
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Get current password hash
      const currentUser = await query(
        'SELECT password FROM users WHERE id = ?',
        [user.userId]
      ) as any[];

      if (currentUser.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser[0].password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateQuery = 'UPDATE users SET name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      updateParams = [name, email, hashedNewPassword, user.userId];
    }

    // Update user
    await query(updateQuery, updateParams);

    // Get updated user data
    const updatedUser = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [user.userId]
    ) as any[];

    return NextResponse.json({ 
      user: updatedUser[0],
      message: 'Profile updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/manage - Delete user account (requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;

    const body = await request.json();
    const { password } = body;

    // Validasi password untuk konfirmasi delete
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      );
    }

    // Get current password hash
    const currentUser = await query(
      'SELECT password FROM users WHERE id = ?',
      [user.userId]
    ) as any[];

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, currentUser[0].password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Delete user (posts and comments will be deleted automatically due to CASCADE)
    await query('DELETE FROM users WHERE id = ?', [user.userId]);

    return NextResponse.json({ 
      message: 'Account deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 