-- Mara Sports Festival Database Schema
-- MySQL 8.0+ Compatible
-- Run this script to create the complete database structure

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `mara_sports_festival` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `mara_sports_festival`;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `hashed_password` TEXT NULL,
    `role` ENUM('admin', 'institute', 'student') NOT NULL DEFAULT 'student',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `last_login_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. INSTITUTIONS TABLE
-- =============================================
CREATE TABLE `institutions` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `user_id` CHAR(36) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` JSON NULL,
    `institution_type` VARCHAR(100) NULL,
    `registration_number` VARCHAR(100) NULL,
    `website` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `verification_date` VARCHAR(50) NULL,
    `verification_notes` TEXT NULL,
    `billing_info` JSON NULL,
    `contact_person_name` VARCHAR(255) NULL,
    `contact_person_phone` VARCHAR(20) NULL,
    `contact_person_email` VARCHAR(255) NULL,
    `logo_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_institutions_name` (`name`),
    INDEX `idx_institutions_email` (`email`),
    INDEX `idx_institutions_registration` (`registration_number`),
    INDEX `idx_institutions_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. STUDENTS TABLE
-- =============================================
CREATE TABLE `students` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `user_id` CHAR(36) NOT NULL UNIQUE,
    `first_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` JSON NULL,
    `medical_info` JSON NULL,
    `guardian` JSON NULL,
    `institution_id` CHAR(36) NULL,
    `student_id` VARCHAR(50) NULL,
    `profile_picture` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE SET NULL,
    INDEX `idx_students_institution` (`institution_id`),
    INDEX `idx_students_student_id` (`student_id`),
    INDEX `idx_students_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. SPORTS TABLE
-- =============================================
CREATE TABLE `sports` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_sports_name` (`name`),
    INDEX `idx_sports_slug` (`slug`),
    INDEX `idx_sports_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. SPORT_CATEGORIES TABLE
-- =============================================
CREATE TABLE `sport_categories` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `sport_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `age_from` INT NOT NULL,
    `age_to` INT NOT NULL,
    `gender_allowed` ENUM('male', 'female', 'mixed') NOT NULL,
    `fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `max_participants` INT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE CASCADE,
    INDEX `idx_sport_categories_sport` (`sport_id`),
    INDEX `idx_sport_categories_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. REGISTRATIONS TABLE
-- =============================================
CREATE TABLE `registrations` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `student_id` CHAR(36) NOT NULL,
    `sport_category_id` CHAR(36) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    `payment_id` CHAR(36) NULL,
    `documents` JSON NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sport_category_id`) REFERENCES `sport_categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_registrations_student` (`student_id`),
    INDEX `idx_registrations_category` (`sport_category_id`),
    INDEX `idx_registrations_payment` (`payment_id`),
    INDEX `idx_registrations_status` (`status`),
    INDEX `idx_registrations_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. PAYMENTS TABLE
-- =============================================
CREATE TABLE `payments` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `registration_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `provider` VARCHAR(50) NOT NULL,
    `provider_payload` JSON NULL,
    `transaction_id` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE,
    INDEX `idx_payments_registration` (`registration_id`),
    INDEX `idx_payments_institution` (`institution_id`),
    INDEX `idx_payments_transaction` (`transaction_id`),
    INDEX `idx_payments_status` (`status`),
    INDEX `idx_payments_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. SPONSORSHIPS TABLE
-- =============================================
CREATE TABLE `sponsorships` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `institution_id` CHAR(36) NOT NULL,
    `sponsor_name` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `terms` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE,
    INDEX `idx_sponsorships_institution` (`institution_id`),
    INDEX `idx_sponsorships_status` (`status`),
    INDEX `idx_sponsorships_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. DOCUMENTS TABLE
-- =============================================
CREATE TABLE `documents` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `owner_type` ENUM('student', 'institution') NOT NULL,
    `owner_id` CHAR(36) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size_bytes` BIGINT NOT NULL,
    `storage_path` VARCHAR(500) NOT NULL,
    `uploaded_by` CHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_documents_owner` (`owner_type`, `owner_id`),
    INDEX `idx_documents_uploaded_by` (`uploaded_by`),
    INDEX `idx_documents_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `user_id` CHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_read` (`is_read`),
    INDEX `idx_notifications_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. OTPS TABLE
-- =============================================
CREATE TABLE `otps` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `user_id` CHAR(36) NOT NULL,
    `email_or_phone` VARCHAR(255) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `purpose` ENUM('registration', 'login', 'password_reset') NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_otps_user` (`user_id`),
    INDEX `idx_otps_email_phone` (`email_or_phone`),
    INDEX `idx_otps_expires` (`expires_at`),
    INDEX `idx_otps_purpose` (`purpose`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. AUDIT_LOGS TABLE
-- =============================================
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `actor_user_id` CHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL,
    `resource_id` CHAR(36) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_audit_logs_actor` (`actor_user_id`),
    INDEX `idx_audit_logs_resource` (`resource_type`, `resource_id`),
    INDEX `idx_audit_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert admin user
INSERT INTO `users` (`id`, `email`, `hashed_password`, `role`, `is_active`, `is_verified`) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'harshadpukale131@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2', -- Password: Hrpukale@131
    'admin',
    TRUE,
    TRUE
);

-- Insert sample sports
INSERT INTO `sports` (`id`, `name`, `slug`, `description`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Football', 'football', 'Association football/soccer'),
('550e8400-e29b-41d4-a716-446655440002', 'Basketball', 'basketball', 'Basketball sport'),
('550e8400-e29b-41d4-a716-446655440003', 'Cricket', 'cricket', 'Cricket sport'),
('550e8400-e29b-41d4-a716-446655440004', 'Tennis', 'tennis', 'Tennis sport'),
('550e8400-e29b-41d4-a716-446655440005', 'Badminton', 'badminton', 'Badminton sport');

-- Insert sample sport categories
INSERT INTO `sport_categories` (`id`, `sport_id`, `name`, `age_from`, `age_to`, `gender_allowed`, `fee`, `max_participants`) VALUES
-- Football categories
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Under 16 Boys', 12, 16, 'male', 500.00, 20),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Under 16 Girls', 12, 16, 'female', 500.00, 20),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Under 19 Boys', 16, 19, 'male', 750.00, 20),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Under 19 Girls', 16, 19, 'female', 750.00, 20),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Senior Men', 19, 25, 'male', 1000.00, 20),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 'Senior Women', 19, 25, 'female', 1000.00, 20),

-- Basketball categories
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 'Under 16 Boys', 12, 16, 'male', 400.00, 15),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Under 16 Girls', 12, 16, 'female', 400.00, 15),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Under 19 Boys', 16, 19, 'male', 600.00, 15),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Under 19 Girls', 16, 19, 'female', 600.00, 15),

-- Cricket categories
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Under 16 Boys', 12, 16, 'male', 600.00, 16),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'Under 19 Boys', 16, 19, 'male', 800.00, 16),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', 'Senior Men', 19, 25, 'male', 1200.00, 16),

-- Tennis categories
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440004', 'Under 16 Boys', 12, 16, 'male', 300.00, 8),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440004', 'Under 16 Girls', 12, 16, 'female', 300.00, 8),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440004', 'Under 19 Boys', 16, 19, 'male', 400.00, 8),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440004', 'Under 19 Girls', 16, 19, 'female', 400.00, 8),

-- Badminton categories
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440005', 'Under 16 Boys', 12, 16, 'male', 250.00, 12),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440005', 'Under 16 Girls', 12, 16, 'female', 250.00, 12),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440005', 'Under 19 Boys', 16, 19, 'male', 350.00, 12),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440005', 'Under 19 Girls', 16, 19, 'female', 350.00, 12);

-- =============================================
-- VERIFY DATABASE CREATION
-- =============================================
SELECT 'Database created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'mara_sports_festival';
SELECT 'Admin user created with email: harshadpukale131@gmail.com' as admin_info;
SELECT 'Password: Hrpukale@131' as admin_password;
