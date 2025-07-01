import { NextResponse } from 'next/server';
import { testConnection, query } from '@/lib/mysql';

export async function GET() {
  try {
    // Test koneksi database
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Test query sederhana
    const result = await query('SELECT 1 as test, NOW() as timestamp');
    
    // Cek apakah tables ada
    const tables = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'nearnnext_db'
    `);

    // Cek jumlah data di setiap table
    const tableCounts = {};
    for (const table of tables) {
      const count = await query(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
      tableCounts[table.TABLE_NAME] = count[0].count;
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully!',
      timestamp: new Date().toISOString(),
      database: 'nearnnext_db',
      test_query: result[0],
      tables: tables.map(t => t.TABLE_NAME),
      table_counts: tableCounts
    }, { status: 200 });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 