-- Migration: 002_create_categories_table.sql
-- Description: Create categories table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Insert default categories
INSERT INTO categories (id, name) VALUES 
('cat_1', 'Technology'),
('cat_2', 'Programming'),
('cat_3', 'Web Development')
ON DUPLICATE KEY UPDATE name = VALUES(name); 