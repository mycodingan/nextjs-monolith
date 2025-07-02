-- Migration: 005_create_comments_table.sql
-- Description: Create comments table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Insert sample comments
INSERT INTO comments (content, author_id, post_id) VALUES 
('Great article! Very helpful for beginners.', 2, 1),
('Thanks for sharing this knowledge!', 1, 2); 