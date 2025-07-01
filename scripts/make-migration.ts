#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

function generateMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.log(`
🚀 NearnNext Make Migration

Usage:
  npm run make:migration <migration_name>

Examples:
  npm run make:migration create_users_table
  npm run make:migration add_user_profiles_table
  npm run make:migration add_post_tags_table
  npm run make:migration update_posts_table

Migration will be created in: migrations/ folder
    `);
    return;
  }

  // Generate migration number
  const migrationsPath = path.join(process.cwd(), 'migrations');
  const existingFiles = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const nextNumber = existingFiles.length + 1;
  const migrationNumber = nextNumber.toString().padStart(3, '0');
  
  // Create filename
  const filename = `${migrationNumber}_${migrationName}.sql`;
  const filePath = path.join(migrationsPath, filename);

  // Generate SQL template
  const sqlTemplate = `-- Migration: ${filename}
-- Description: ${migrationName.replace(/_/g, ' ')}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS table_name (
--   id VARCHAR(255) PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Example INSERT:
-- INSERT INTO table_name (id, name) VALUES 
-- ('id_1', 'Sample Data')
-- ON DUPLICATE KEY UPDATE name = VALUES(name);
`;

  try {
    // Create migrations directory if not exists
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // Write migration file
    fs.writeFileSync(filePath, sqlTemplate);
    
    console.log(`✅ Migration created: ${filename}`);
    console.log(`📁 Location: ${filePath}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Edit the migration file`);
    console.log(`2. Add your SQL statements`);
    console.log(`3. Run: npm run migrate:migrate`);
    
  } catch (error) {
    console.error('❌ Error creating migration:', error);
  }
}

generateMigration(); 