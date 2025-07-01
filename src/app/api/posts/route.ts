import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const authorId = searchParams.get('authorId');
    const category = searchParams.get('category');

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (published !== null) {
      whereClause += ' AND p.published = ?';
      params.push(published === 'true' ? 1 : 0);
    }
    
    if (authorId) {
      whereClause += ' AND p.author_id = ?';
      params.push(authorId);
    }
    
    if (category) {
      whereClause += ' AND c.name = ?';
      params.push(category);
    }

    // Query dengan JOIN untuk mendapatkan author dan categories
    const posts = await query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.published,
        p.created_at,
        p.updated_at,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email,
        GROUP_CONCAT(DISTINCT cat.name) as categories,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories cat ON pc.category_id = cat.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, params);

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, published = false, authorId, categoryNames = [] } = body;

    // Validasi input
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, and authorId are required' },
        { status: 400 }
      );
    }

    // Cek apakah author exists
    const authors = await query(
      'SELECT id FROM users WHERE id = ?',
      [authorId]
    );

    if (authors.length === 0) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    const postId = uuidv4();

    // Buat post
    await query(
      'INSERT INTO posts (id, title, content, published, author_id) VALUES (?, ?, ?, ?, ?)',
      [postId, title, content, published ? 1 : 0, authorId]
    );

    // Tambahkan categories jika ada
    if (categoryNames.length > 0) {
      for (const categoryName of categoryNames) {
        // Cek apakah category sudah ada, jika tidak buat baru
        let categories = await query(
          'SELECT id FROM categories WHERE name = ?',
          [categoryName]
        );

        let categoryId;
        if (categories.length === 0) {
          categoryId = uuidv4();
          await query(
            'INSERT INTO categories (id, name) VALUES (?, ?)',
            [categoryId, categoryName]
          );
        } else {
          categoryId = categories[0].id;
        }

        // Hubungkan post dengan category
        await query(
          'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
          [postId, categoryId]
        );
      }
    }

    // Ambil post yang baru dibuat dengan author dan categories
    const newPosts = await query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.published,
        p.created_at,
        p.updated_at,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email,
        GROUP_CONCAT(DISTINCT cat.name) as categories
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories cat ON pc.category_id = cat.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [postId]);

    return NextResponse.json({ post: newPosts[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 