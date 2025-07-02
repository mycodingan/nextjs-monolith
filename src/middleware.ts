import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Paths yang memerlukan authentication
  const protectedPaths = [
    '/api/users',
    '/api/posts',
    '/api/comments',
  ];

  const path = request.nextUrl.pathname;
  
  // Cek apakah path memerlukan authentication
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath) && path !== '/api/auth/login'
  );
  
  console.log('🔍 Middleware debug:', {
    path,
    isProtectedPath,
    protectedPaths,
    isDevelopment: process.env.NODE_ENV === 'development'
  });

  // Development mode - bypass token untuk testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassToken = isDevelopment && request.nextUrl.searchParams.get('bypass') === 'true';

  if (isProtectedPath && !bypassToken) {
    console.log('🔐 Protected path detected, checking for Authorization header...');
    
    const authHeader = request.headers.get('authorization');
    console.log('📨 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Just check if the header exists and has the right format
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header format');
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    console.log('✅ Authorization header present and valid format');
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 