import mysql from 'mysql2/promise';

// Konfigurasi database seperti di Laravel
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // default Laragon kosong
  database: 'nearnnext_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Buat connection pool
export const db = mysql.createPool(dbConfig);

// Test koneksi
export async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function untuk query
export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
} 