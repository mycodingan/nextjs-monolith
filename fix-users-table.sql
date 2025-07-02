-- Fix users table structure - Back to original (VARCHAR id)
-- Run this in HeidiSQL

-- Drop foreign key constraints first
ALTER TABLE posts DROP FOREIGN KEY posts_ibfk_1;
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;

-- Drop existing table and recreate with original structure
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert only 1 admin user (password: password123)
INSERT INTO users (id, email, name, password, role) VALUES 
('admin_001', 'admin@example.com', 'Admin User', '$2b$10$adDjp70oBRc89UfQ/1EBfe3lQ3CcPwb0A.aNKXxCivpu7pt88uBdi', 'ADMIN');

-- Recreate foreign key constraints
ALTER TABLE posts ADD CONSTRAINT posts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; 