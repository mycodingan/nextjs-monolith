-- Migration: 005_create_comments_table.sql
-- Description: Create comments table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(255) PRIMARY KEY,
  content TEXT NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  post_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Insert sample comments
INSERT INTO comments (id, content, author_id, post_id) VALUES 
('comment_1', 'Great article! Very helpful for beginners.', 'user_2', 'post_1'),
('comment_2', 'Thanks for sharing this knowledge!', 'user_1', 'post_2')
ON DUPLICATE KEY UPDATE content = VALUES(content); 