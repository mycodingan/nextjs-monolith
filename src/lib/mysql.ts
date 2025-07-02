import mysql from 'mysql2/promise';
import { appConfig } from './config';

// Konfigurasi database dari config file
const dbConfig = appConfig.database;

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