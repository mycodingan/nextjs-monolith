#!/usr/bin/env tsx

import { MigrationManager } from '../src/lib/migration';
import { query } from '../src/lib/mysql';

async function main() {
  const command = process.argv[2];
  const migrationManager = new MigrationManager();

  try {
    switch (command) {
      case 'migrate':
        await migrationManager.migrate();
        break;
      
      case 'rollback':
        await migrationManager.rollback();
        break;
      
      case 'status':
        await migrationManager.status();
        break;
      
      case 'fresh':
        console.log('🔄 Fresh migration (drop all tables and re-run)...');
        
        // Drop all tables in correct order (respecting foreign keys)
        console.log('🗑️ Dropping all tables...');
        await query('DROP TABLE IF EXISTS post_categories');
        await query('DROP TABLE IF EXISTS comments');
        await query('DROP TABLE IF EXISTS posts');
        await query('DROP TABLE IF EXISTS categories');
        await query('DROP TABLE IF EXISTS users');
        
        // Clear migrations table
        await query('DELETE FROM migrations');
        
        console.log('✅ All tables dropped, starting fresh migration...\n');
        await migrationManager.migrate();
        break;
      
      default:
        console.log(`
🚀 NearnNext Migration Commands:

  npm run migrate:migrate    - Run pending migrations
  npm run migrate:rollback   - Rollback last migration batch
  npm run migrate:status     - Show migration status
  npm run migrate:fresh      - Fresh migration (drop all and re-run)

Examples:
  npm run migrate:migrate
  npm run migrate:status
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Migration command failed:', error);
    process.exit(1);
  }
}

main(); 