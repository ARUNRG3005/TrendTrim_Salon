-- =============================================================================
-- LuxeBook Premium Salon Concierge: Production PostgreSQL Schema Setup
-- Target Version: PostgreSQL 15+
-- =============================================================================

-- =============================================================================
-- 0. Extensions & Core Infrastructure
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. Domain Types and Custom Enums
-- =============================================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'STYLIST');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE stylist_employment_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NOSHOW');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE txn_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'MOBILE_PAY');
CREATE TYPE moderation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- =============================================================================
-- 2. Schema Definition & Tables
-- =============================================================================

-- 2.1 Membership Tiers
CREATE TABLE membership_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (discount_percentage >= 0.00 AND discount_percentage <= 100.00),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  membership_tier_id INT REFERENCES membership_tiers(id) ON DELETE SET NULL,
  status account_status NOT NULL DEFAULT 'ACTIVE',
  profile_photo_url TEXT,
  phone VARCHAR(20),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2.3 User Activity Logs (Authentication, login, logout, password resets)
CREATE TABLE user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45), -- Supports IPv4 and IPv6
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Audit Logs (System Action Tracker for data changes)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.5 Service Categories
CREATE TABLE service_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2.6 Services
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES service_categories(id),
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0.00),
  discount_price NUMERIC(10,2) CHECK (discount_price >= 0.00),
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2.7 Service Images
CREATE TABLE service_images (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 Stylists
CREATE TABLE stylists (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  specialization VARCHAR(150),
  experience_years INT NOT NULL CHECK (experience_years >= 0),
  employment_status stylist_employment_status NOT NULL DEFAULT 'ACTIVE',
  average_rating NUMERIC(3,2) DEFAULT 5.00 CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2.9 Stylist Services (Many-to-Many Relationship)
CREATE TABLE stylist_services (
  stylist_id INT REFERENCES stylists(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (stylist_id, service_id)
);

-- 2.10 Stylist Availability Schedule
CREATE TABLE stylist_availability (
  id SERIAL PRIMARY KEY,
  stylist_id INT NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_times CHECK (end_time > start_time)
);

-- 2.11 Stylist Portfolio Gallery
CREATE TABLE stylist_portfolio (
  id SERIAL PRIMARY KEY,
  stylist_id INT NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 Bookings
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY, -- BK-XXXX format compatible
  user_id INT NOT NULL REFERENCES users(id),
  stylist_id INT NOT NULL REFERENCES stylists(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  notes TEXT,
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0.00),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2.13 Booking Services
CREATE TABLE booking_services (
  booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id),
  price_charged NUMERIC(10,2) NOT NULL CHECK (price_charged >= 0.00),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  PRIMARY KEY (booking_id, service_id)
);

-- 2.14 Booking Rescheduling History
CREATE TABLE booking_reschedule_history (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  previous_date DATE NOT NULL,
  previous_time TIME NOT NULL,
  new_date DATE NOT NULL,
  new_time TIME NOT NULL,
  reason TEXT,
  rescheduled_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.15 Booking Cancellation Records
CREATE TABLE booking_cancellation_records (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  reason TEXT,
  cancelled_by INT NOT NULL REFERENCES users(id),
  refunded_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (refunded_amount >= 0.00),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.16 Payment Records
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL REFERENCES bookings(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0.00),
  payment_method payment_method NOT NULL,
  payment_status txn_status NOT NULL DEFAULT 'COMPLETED',
  transaction_reference VARCHAR(150),
  invoice_number VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.17 Refund Tracking
CREATE TABLE refunds (
  id SERIAL PRIMARY KEY,
  payment_id INT NOT NULL REFERENCES payments(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0.00),
  status txn_status NOT NULL DEFAULT 'COMPLETED',
  reason TEXT,
  processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.18 Customer Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id),
  stylist_id INT NOT NULL REFERENCES stylists(id),
  service_id INT NOT NULL REFERENCES services(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_status moderation_status NOT NULL DEFAULT 'PENDING',
  moderated_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. Automation Triggers for Updating Timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON stylists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- 4. Database Indexing Strategy
-- =============================================================================
-- Fast lookup for auth and profile retrieval
CREATE INDEX idx_users_active_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);

-- Booking tracking & scheduler checks
CREATE INDEX idx_bookings_user_active ON bookings(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_stylist_active ON bookings(stylist_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_datetime ON bookings(appointment_date, appointment_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status);

-- Service Categories & Availability
CREATE INDEX idx_services_category ON services(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_available ON services(id) WHERE is_available = TRUE AND deleted_at IS NULL;

-- Reviews lookup by stylist & service
CREATE INDEX idx_reviews_stylist_rating ON reviews(stylist_id, rating);
CREATE INDEX idx_reviews_service_rating ON reviews(service_id, rating);

-- Financial Auditing Indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- Partition-friendly logs indexes (ordered descending for dashboard listing)
CREATE INDEX idx_activity_logs_user_time ON user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_time ON audit_logs(actor_id, created_at DESC);

-- =============================================================================
-- 5. Enterprise Security & Recommendations
-- =============================================================================

-- 5.1 Row-Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 5.2 RLS Policies for Users Table
-- Users can read their own profile, Admins can read all profiles
CREATE POLICY select_user_policy ON users
  FOR SELECT
  USING (email = current_setting('request.jwt.claim.email', true) OR current_setting('request.jwt.claim.role', true) = 'ADMIN');

-- Users can edit their own profiles, Admins can edit all
CREATE POLICY update_user_policy ON users
  FOR UPDATE
  USING (email = current_setting('request.jwt.claim.email', true) OR current_setting('request.jwt.claim.role', true) = 'ADMIN');

-- 5.3 RLS Policies for Bookings Table
-- Users can view their own bookings, Stylists can view assigned bookings, Admins can view all
CREATE POLICY select_booking_policy ON bookings
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claim.email', true))
    OR stylist_id = (SELECT id FROM stylists WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claim.email', true)))
    OR current_setting('request.jwt.claim.role', true) = 'ADMIN'
  );

-- 5.4 Database Hardening
-- A. Connections: Always enable SSL mode (sslmode=verify-full) in the server environment configuration.
-- B. Password Storage: Enforce Argon2id or bcrypt hashing on server side.
-- C. Least Privilege: The web application should connect using a role (e.g. `luxebook_app`) that only has SELECT, INSERT, UPDATE, DELETE permissions on schema tables, and no DDL privilege.
-- D. Sensitive Data Encryption: Credit card numbers or bank info MUST NOT be stored. Sensitive field encryption (e.g., PII like phone numbers) can be encrypted at rest using pg_crypto's pgp_sym_encrypt if requested.

-- =============================================================================
-- 6. Performance Optimization Strategy
-- =============================================================================
-- 1. Connection Pooling: Use pgBouncer in transaction mode to handle up to thousands of active client sessions.
-- 2. Query Analysis: Frequently run EXPLAIN ANALYZE on slow booking/calendar range queries to ensure index scans are preferred.
-- 3. Autovacuum Tuning: High write-frequency tables like bookings, payments, and activity logs should have customized autovacuum settings:
--    ALTER TABLE bookings SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
-- 4. Materialized Views: For admin dashboard statistics (revenue distributions, historical stylist ratings), use materialized views updated hourly.
