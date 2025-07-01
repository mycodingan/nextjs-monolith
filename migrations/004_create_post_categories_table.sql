-- Migration: 004_create_post_categories_table.sql
-- Description: Create post_categories table (many-to-many)
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS post_categories (
  post_id VARCHAR(255) NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert sample post categories
INSERT INTO post_categories (post_id, category_id) VALUES 
('post_1', 'cat_1'),
('post_1', 'cat_2'),
('post_2', 'cat_2'),
('post_2', 'cat_3')
ON DUPLICATE KEY UPDATE post_id = VALUES(post_id); 