import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { appConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const users = await query(
      'SELECT id, email, name, password, role FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log('🔐 LOGIN DEBUG:');
    console.log('JWT Secret from config:', appConfig.jwt.secret);
    console.log('JWT Secret length:', appConfig.jwt.secret.length);
    
    const options: SignOptions = { expiresIn: appConfig.jwt.expiresIn as jwt.SignOptions['expiresIn'] };
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      appConfig.jwt.secret,
      options
    );
    
    console.log('Token generated:', token ? 'Yes' : 'No');
    console.log('Token length:', token.length);

    // Return user data (tanpa password) dan token
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 