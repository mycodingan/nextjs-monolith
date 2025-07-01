import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

  // Development mode - bypass token untuk testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassToken = isDevelopment && request.nextUrl.searchParams.get('bypass') === 'true';

  if (isProtectedPath && !bypassToken) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    try {
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Tambahkan user info ke headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(decoded));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 