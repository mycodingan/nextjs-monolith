-- Migration: 003_create_posts_table.sql
-- Description: Create posts table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample posts
INSERT INTO posts (title, content, published, author_id) VALUES 
('Getting Started with Next.js', 'Next.js is a powerful React framework that makes building full-stack web applications simple and efficient.', TRUE, 1),
('Building APIs with Next.js', 'Next.js provides excellent support for building APIs. You can create API routes directly in your Next.js application.', TRUE, 2); 