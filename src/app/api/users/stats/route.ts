import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireAdmin, AuthenticatedUser } from '@/lib/auth';

// GET /api/users/stats - Get user statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const admin = authResult;

    // Get total users count
    const totalUsers = await query('SELECT COUNT(*) as count FROM users') as any[];
    
    // Get users by role
    const usersByRole = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `) as any[];
    
    // Get recent users (last 7 days)
    const recentUsers = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `) as any[];
    
    // Get users with most posts
    const topUsers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      GROUP BY u.id
      ORDER BY post_count DESC
      LIMIT 5
    `) as any[];
    
    // Get users with most comments
    const topCommenters = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(c.id) as comment_count
      FROM users u
      LEFT JOIN comments c ON u.id = c.author_id
      GROUP BY u.id
      ORDER BY comment_count DESC
      LIMIT 5
    `) as any[];

    const stats = {
      totalUsers: totalUsers[0].count,
      usersByRole: usersByRole,
      recentUsers: recentUsers[0].count,
      topUsers: topUsers,
      topCommenters: topCommenters
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 