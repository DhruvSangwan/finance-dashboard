-- =============================================================
-- DATABASE SCHEMA
-- Run this file once to set up your database tables.
-- In psql: \i backend/config/schema.sql
-- =============================================================

-- USERS table: stores account info
-- Each user has a unique id, email, and hashed password
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,              -- auto-incrementing unique ID
  name VARCHAR(100) NOT NULL,         -- display name
  email VARCHAR(255) UNIQUE NOT NULL, -- must be unique
  password_hash VARCHAR(255) NOT NULL,-- we NEVER store plain passwords
  created_at TIMESTAMP DEFAULT NOW()  -- when they signed up
);

-- EXPENSES table: each row is one expense
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- linked to a user
  title VARCHAR(200) NOT NULL,        -- e.g. "Lunch at Subway"
  amount DECIMAL(10, 2) NOT NULL,     -- e.g. 12.50
  category VARCHAR(50) NOT NULL,      -- Food, Transport, etc.
  expense_date DATE NOT NULL,         -- when the expense happened
  notes TEXT,                         -- optional extra info
  created_at TIMESTAMP DEFAULT NOW()
);

-- BUDGETS table: monthly spending goals
-- One row per user (they can update it anytime)
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  monthly_limit DECIMAL(10, 2) NOT NULL, -- their spending goal
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index to speed up queries that filter by user_id
-- Without this, PostgreSQL would scan EVERY expense row
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
