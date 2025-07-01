-- Migration: 003_create_posts_table.sql
-- Description: Create posts table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  author_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample posts
INSERT INTO posts (id, title, content, published, author_id) VALUES 
('post_1', 'Getting Started with Next.js', 'Next.js is a powerful React framework that makes building full-stack web applications simple and efficient.', TRUE, 'user_1'),
('post_2', 'Building APIs with Next.js', 'Next.js provides excellent support for building APIs. You can create API routes directly in your Next.js application.', TRUE, 'user_2')
ON DUPLICATE KEY UPDATE title = VALUES(title); 