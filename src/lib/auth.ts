import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { query } from './mysql';
import { appConfig } from './config';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

// Middleware untuk verifikasi JWT token
export async function verifyToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith(appConfig.security.tokenPrefix)) {
      return null;
    }

    const token = authHeader.substring(appConfig.security.tokenPrefix.length);
    
    // DEBUG LOG
    console.log('=== VERIFY TOKEN DEBUG ===');
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Token length:', token.length);
    console.log('JWT Secret from config:', appConfig.jwt.secret);
    console.log('JWT Secret length:', appConfig.jwt.secret.length);
    
    const decoded = jwt.verify(token, appConfig.jwt.secret) as JwtPayload;
    
    // Verifikasi user masih ada di database
    console.log('🔍 Checking user in database...');
    console.log('🔍 Looking for user with ID:', decoded.userId, 'and email:', decoded.email);
    
    const users = await query(
      'SELECT id, email, role FROM users WHERE id = ? AND email = ?',
      [decoded.userId, decoded.email]
    ) as any[];

    console.log('🔍 Database query result:', users);
    console.log('🔍 Number of users found:', users.length);

    if (users.length === 0) {
      console.log('❌ No user found in database');
      return null;
    }

    console.log('✅ User found in database:', users[0]);

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Middleware untuk protected routes (butuh authentication)
export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthenticatedUser> {
  const user = await verifyToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return user;
}

// Middleware untuk admin-only routes
export async function requireAdmin(request: NextRequest): Promise<NextResponse | AuthenticatedUser> {
  console.log('🔐 REQUIRE ADMIN - Starting admin check...');
  
  const user = await verifyToken(request);
  console.log('🔐 REQUIRE ADMIN - User from verifyToken:', user);
  
  if (!user) {
    console.log('❌ REQUIRE ADMIN - No user found');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  console.log('🔐 REQUIRE ADMIN - User role:', user.role);
  
  if (user.role !== 'ADMIN') {
    console.log('❌ REQUIRE ADMIN - User is not admin');
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  console.log('✅ REQUIRE ADMIN - Admin access granted');
  return user;
}

// Helper untuk mengekstrak user dari request (untuk optional auth)
export async function getOptionalUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  return await verifyToken(request);
} 