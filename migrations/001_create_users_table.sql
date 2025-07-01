-- Migration: 001_create_users_table.sql
-- Description: Create users table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, name, password, role) VALUES 
('user_1', 'admin@example.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'ADMIN'),
('user_2', 'user@example.com', 'Regular User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'USER')
ON DUPLICATE KEY UPDATE name = VALUES(name);  