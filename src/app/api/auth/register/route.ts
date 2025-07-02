import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { appConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Registration attempt started...');
    
    const body = await request.json();
    const { name, email, password } = body;

    console.log('📝 Registration data:', { name, email, password: '***' });

    // Validasi input
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Test database connection first
    try {
      await query('SELECT 1 as test');
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Cek apakah email sudah terdaftar
    console.log('🔍 Checking if email exists...');
    const users = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];
    
    console.log('👥 Existing users with email:', users.length);
    
    if (users.length > 0) {
      console.log('❌ Email already registered');
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, appConfig.security.bcryptRounds);
    console.log('✅ Password hashed');

    // Insert user baru (tanpa mengisi id karena AUTO_INCREMENT)
    console.log('📝 Inserting new user...');
    // Jika body ada role dan isinya ADMIN, pakai ADMIN, selain itu USER
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER';
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    console.log('✅ User inserted');

    // Ambil user yang baru dibuat
    console.log('🔍 Fetching new user data...');
    const newUserRows = await query(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [email]
    ) as any[];
    const newUser = newUserRows[0];
    console.log('✅ New user data:', newUser);

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const options: SignOptions = { expiresIn: appConfig.jwt.expiresIn as jwt.SignOptions['expiresIn'] };
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      appConfig.jwt.secret,
      options
    );
    console.log('✅ JWT token generated');

    console.log('✅ Registration successful for:', newUser.email);

    return NextResponse.json(
      {
        user: newUser,
        token,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error during registration:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 