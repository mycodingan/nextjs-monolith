-- Migration: 002_create_categories_table.sql
-- Description: Create categories table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
('Technology'),
('Programming'),
('Web Development'); 