#!/usr/bin/env tsx

import { MigrationManager } from '../src/lib/migration';

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
        // Note: Implement fresh migration if needed
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