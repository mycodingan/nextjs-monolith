import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireAuth, AuthenticatedUser } from '@/lib/auth';

// GET /api/posts - Get all posts (public)
export async function GET(request: NextRequest) {
  try {
    const posts = await query(`
      SELECT p.*, u.name as author_name 
      FROM posts p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE p.published = TRUE 
      ORDER BY p.created_at DESC
    `) as any[];

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;

    const body = await request.json();
    const { title, content, published = false, categoryIds = [] } = body;

    // Validasi input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Buat post baru (tanpa mengisi id karena AUTO_INCREMENT)
    const result = await query(
      'INSERT INTO posts (title, content, published, author_id) VALUES (?, ?, ?, ?)',
      [title, content, published, user.userId]
    );

    // Ambil post yang baru dibuat
    const newPost = await query(`
      SELECT p.*, u.name as author_name 
      FROM posts p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE p.id = LAST_INSERT_ID()
    `) as any[];

    // Tambahkan categories jika ada
    if (categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        // Cek apakah category exists
        const categories = await query(
          'SELECT id FROM categories WHERE id = ?',
          [categoryId]
        ) as any[];

        if (categories.length > 0) {
          // Hubungkan post dengan category
          await query(
            'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
            [newPost[0].id, categoryId]
          );
        }
      }
    }

    return NextResponse.json({ post: newPost[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 