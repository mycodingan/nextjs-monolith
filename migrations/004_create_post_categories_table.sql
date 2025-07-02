-- Migration: 004_create_post_categories_table.sql
-- Description: Create post_categories table (many-to-many)
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS post_categories (
  post_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert sample post categories
INSERT INTO post_categories (post_id, category_id) VALUES 
(1, 1),
(1, 2),
(2, 2),
(2, 3); 