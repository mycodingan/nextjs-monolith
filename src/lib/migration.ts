import { query } from './mysql';
import fs from 'fs';
import path from 'path';

interface Migration {
  id: string;
  name: string;
  sql: string;
}

export class MigrationManager {
  private migrationsPath = path.join(process.cwd(), 'migrations');

  // Buat table migrations jika belum ada
  async createMigrationsTable() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration VARCHAR(255) NOT NULL,
          batch INT NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Migrations table created/verified');
    } catch (error) {
      console.error('❌ Error creating migrations table:', error);
      throw error;
    }
  }

  // Ambil semua file migration
  getMigrationFiles(): string[] {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Urutkan berdasarkan nama file
    } catch (error) {
      console.error('❌ Error reading migrations directory:', error);
      return [];
    }
  }

  // Parse migration file
  parseMigrationFile(filename: string): Migration {
    const filePath = path.join(this.migrationsPath, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Extract migration name from filename (e.g., "001_create_users_table.sql" -> "001_create_users_table")
    const name = filename.replace('.sql', '');
    
    return {
      id: name,
      name: name,
      sql: sql
    };
  }

  // Ambil migrations yang sudah dijalankan
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await query('SELECT migration FROM migrations ORDER BY id');
      return result.map((row: any) => row.migration);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      return [];
    }
  }

  // Jalankan migration
  async runMigration(migration: Migration, batch: number) {
    try {
      console.log(`🔄 Running migration: ${migration.name}`);
      
      // Split SQL by semicolon and execute each statement
      const statements = migration.sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }

      // Record migration as executed
      await query(
        'INSERT INTO migrations (migration, batch) VALUES (?, ?)',
        [migration.name, batch]
      );

      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.name}`, error);
      throw error;
    }
  }

  // Jalankan semua migrations
  async migrate() {
    try {
      console.log('🚀 Starting database migration...\n');

      // Buat table migrations
      await this.createMigrationsTable();

      // Ambil file migrations
      const migrationFiles = this.getMigrationFiles();
      if (migrationFiles.length === 0) {
        console.log('📭 No migration files found');
        return;
      }

      // Ambil migrations yang sudah dijalankan
      const executedMigrations = await this.getExecutedMigrations();

      // Filter migrations yang belum dijalankan
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file.replace('.sql', ''))
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

      // Ambil batch number terbaru
      const latestBatch = await this.getLatestBatch();
      const currentBatch = latestBatch + 1;

      // Jalankan migrations
      for (const filename of pendingMigrations) {
        const migration = this.parseMigrationFile(filename);
        await this.runMigration(migration, currentBatch);
      }

      console.log(`\n🎉 Migration completed! ${pendingMigrations.length} migrations executed`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Ambil batch number terbaru
  async getLatestBatch(): Promise<number> {
    try {
      const result = await query('SELECT MAX(batch) as latest_batch FROM migrations');
      return result[0]?.latest_batch || 0;
    } catch (error) {
      return 0;
    }
  }

  // Rollback migration terakhir
  async rollback() {
    try {
      console.log('🔄 Rolling back last migration batch...\n');

      const latestBatch = await this.getLatestBatch();
      if (latestBatch === 0) {
        console.log('📭 No migrations to rollback');
        return;
      }

      const migrations = await query(
        'SELECT migration FROM migrations WHERE batch = ? ORDER BY id DESC',
        [latestBatch]
      );

      console.log(`📋 Rolling back ${migrations.length} migrations from batch ${latestBatch}`);

      // Note: Untuk rollback yang proper, perlu buat rollback SQL
      // Untuk sekarang, hanya hapus record dari table migrations
      await query('DELETE FROM migrations WHERE batch = ?', [latestBatch]);

      console.log(`✅ Rollback completed for batch ${latestBatch}`);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  // Status migrations
  async status() {
    try {
      console.log('📊 Migration Status:\n');

      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      console.log('Migration Files:');
      for (const file of migrationFiles) {
        const migrationName = file.replace('.sql', '');
        const isExecuted = executedMigrations.includes(migrationName);
        const status = isExecuted ? '✅ Executed' : '⏳ Pending';
        console.log(`  ${migrationName}: ${status}`);
      }

      console.log(`\nTotal: ${migrationFiles.length} files, ${executedMigrations.length} executed`);
    } catch (error) {
      console.error('❌ Error getting migration status:', error);
    }
  }
} 