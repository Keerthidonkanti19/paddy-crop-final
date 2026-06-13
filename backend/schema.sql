-- Paddy Crop Disease Detection — PostgreSQL schema
-- Run: psql -U postgres -d your_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile_number);

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile_expiry ON otp_codes (mobile_number, expiry_time);

CREATE TABLE IF NOT EXISTS detection_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    predicted_disease VARCHAR(255) NOT NULL,
    fertilizers TEXT,
    pesticides TEXT,
    confidence_score VARCHAR(32),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user_time ON detection_history (user_id, timestamp DESC);
