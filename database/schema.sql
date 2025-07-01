-- Database schema untuk nearnnext_db
-- Jalankan script ini di HeidiSQL untuk membuat tables

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS nearnnext_db;
USE nearnnext_db;

-- Table Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Table Posts
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

-- Table Post Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_categories (
  post_id VARCHAR(255) NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Table Comments
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

-- Insert sample data
INSERT INTO categories (id, name) VALUES 
('cat_1', 'Technology'),
('cat_2', 'Programming'),
('cat_3', 'Web Development')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample users (password: admin123 - hashed with bcrypt)
INSERT INTO users (id, email, name, password, role) VALUES 
('user_1', 'admin@example.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'ADMIN'),
('user_2', 'user@example.com', 'Regular User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'USER')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample posts
INSERT INTO posts (id, title, content, published, author_id) VALUES 
('post_1', 'Getting Started with Next.js', 'Next.js is a powerful React framework that makes building full-stack web applications simple and efficient.', TRUE, 'user_1'),
('post_2', 'Building APIs with Next.js', 'Next.js provides excellent support for building APIs. You can create API routes directly in your Next.js application.', TRUE, 'user_2')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert post categories
INSERT INTO post_categories (post_id, category_id) VALUES 
('post_1', 'cat_1'),
('post_1', 'cat_2'),
('post_2', 'cat_2'),
('post_2', 'cat_3')
ON DUPLICATE KEY UPDATE post_id = VALUES(post_id);

-- Insert sample comments
INSERT INTO comments (id, content, author_id, post_id) VALUES 
('comment_1', 'Great article! Very helpful for beginners.', 'user_2', 'post_1'),
('comment_2', 'Thanks for sharing this knowledge!', 'user_1', 'post_2')
ON DUPLICATE KEY UPDATE content = VALUES(content); 