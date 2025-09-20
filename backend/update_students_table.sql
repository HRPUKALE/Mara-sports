-- Update students table to include all fields from the Student model
-- This script adds all the missing fields to the students table

USE mara_sports_festival;

-- Add missing fields to students table
ALTER TABLE `students` 
ADD COLUMN `email` VARCHAR(255) NOT NULL AFTER `phone`,
ADD COLUMN `institution_name` VARCHAR(255) NULL AFTER `institution_id`,
ADD COLUMN `parent_guardian_name` VARCHAR(255) NULL AFTER `student_id`,
ADD COLUMN `parent_phone` VARCHAR(20) NULL AFTER `parent_guardian_name`,
ADD COLUMN `parent_email` VARCHAR(255) NULL AFTER `parent_phone`,
ADD COLUMN `emergency_contact_name` VARCHAR(255) NULL AFTER `parent_email`,
ADD COLUMN `emergency_contact_relation` VARCHAR(100) NULL AFTER `emergency_contact_name`,
ADD COLUMN `emergency_contact_phone` VARCHAR(20) NULL AFTER `emergency_contact_relation`,
ADD COLUMN `emergency_contact_email` VARCHAR(255) NULL AFTER `emergency_contact_phone`,
ADD COLUMN `medical_question_1` VARCHAR(500) NULL AFTER `emergency_contact_email`,
ADD COLUMN `medical_question_2` VARCHAR(500) NULL AFTER `medical_question_1`,
ADD COLUMN `has_allergies` TINYINT(1) NOT NULL DEFAULT 0 AFTER `medical_question_2`,
ADD COLUMN `allergies_details` VARCHAR(1000) NULL AFTER `has_allergies`,
ADD COLUMN `participation_type` VARCHAR(50) NULL AFTER `allergies_details`,
ADD COLUMN `selected_sports` JSON NULL AFTER `participation_type`,
ADD COLUMN `student_id_image` VARCHAR(500) NULL AFTER `selected_sports`,
ADD COLUMN `age_proof_image` VARCHAR(500) NULL AFTER `student_id_image`,
ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`;

-- Update middle_name to be NOT NULL (as per our recent changes)
ALTER TABLE `students` MODIFY COLUMN `middle_name` VARCHAR(100) NOT NULL;

-- Add indexes for new fields
ALTER TABLE `students` 
ADD INDEX `idx_students_email` (`email`),
ADD INDEX `idx_students_institution_name` (`institution_name`),
ADD INDEX `idx_students_verified` (`is_verified`);

-- Create consent_forms table for consent management
CREATE TABLE IF NOT EXISTS `consent_forms` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('waiver', 'privacy', 'medical', 'photo', 'transport') NOT NULL,
    `description` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `version` VARCHAR(20) NOT NULL DEFAULT '1.0',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `expires_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_consent_forms_type` (`type`),
    INDEX `idx_consent_forms_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create student_consents table to track student consent agreements
CREATE TABLE IF NOT EXISTS `student_consents` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `student_id` CHAR(36) NOT NULL,
    `consent_form_id` CHAR(36) NOT NULL,
    `status` ENUM('required', 'pending', 'completed', 'expired') NOT NULL DEFAULT 'required',
    `digital_signature` TEXT NULL,
    `agreed_at` DATETIME NULL,
    `expires_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`consent_form_id`) REFERENCES `consent_forms`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_student_consent` (`student_id`, `consent_form_id`),
    INDEX `idx_student_consents_student` (`student_id`),
    INDEX `idx_student_consents_consent` (`consent_form_id`),
    INDEX `idx_student_consents_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create student_profiles table for additional profile information
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `student_id` CHAR(36) NOT NULL UNIQUE,
    `bio` TEXT NULL,
    `interests` JSON NULL,
    `achievements` JSON NULL,
    `social_links` JSON NULL,
    `preferences` JSON NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_profiles_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample consent forms
INSERT INTO `consent_forms` (`id`, `title`, `type`, `description`, `content`, `version`) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'Waiver & Liability Release', 'waiver', 'Acknowledgment of risks and release of liability for sports participation', 'WAIVER AND RELEASE OF LIABILITY\n\nI, the undersigned participant (or parent/guardian if participant is under 18), acknowledge and agree to the following:\n\nASSUMPTION OF RISK:\nI understand that participation in sports activities involves inherent risks including but not limited to:\n- Physical injury, disability, or death\n- Property damage or loss\n- Accidents during transportation to and from events\n- Injuries from other participants, equipment, or facilities\n\nRELEASE OF LIABILITY:\nI hereby release, waive, discharge, and covenant not to sue the Sports Event Management Organization, its officers, employees, volunteers, sponsors, and affiliated organizations from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury that may be sustained while participating in sports activities.\n\nMEDICAL TREATMENT:\nI consent to emergency medical treatment if needed and understand that I am responsible for all medical expenses incurred.\n\nPHOTOGRAPHIC RELEASE:\nI consent to the use of photographs, videos, or other recordings of my participation for promotional purposes.\n\nThis waiver is binding and effective for all sports events organized by the institution during the current academic year.', '1.0'),
('550e8400-e29b-41d4-a716-446655440101', 'Privacy Notice & Data Processing', 'privacy', 'Understanding how your personal information is collected and used', 'PRIVACY NOTICE AND DATA PROCESSING CONSENT\n\nINFORMATION COLLECTION:\nWe collect and process the following personal information:\n- Personal details (name, date of birth, contact information)\n- Academic information (student ID, institution details)\n- Medical information (for safety and emergency purposes)\n- Guardian/parent contact information\n- Emergency contact details\n- Sports participation preferences\n\nDATA USAGE:\nYour information is used for:\n- Event registration and management\n- Safety and emergency purposes\n- Communication about events and updates\n- Statistical analysis (anonymized)\n- Compliance with legal requirements\n\nDATA PROTECTION:\nWe implement appropriate security measures to protect your personal information and will not share it with third parties without your consent, except as required by law.\n\nYOUR RIGHTS:\nYou have the right to:\n- Access your personal information\n- Correct inaccurate information\n- Request deletion of your information\n- Withdraw consent at any time\n\nBy agreeing to this privacy notice, you consent to the collection, processing, and storage of your personal information as described above.', '1.0'),
('550e8400-e29b-41d4-a716-446655440102', 'Medical Information Consent', 'medical', 'Consent for collection and use of medical information for safety purposes', 'MEDICAL INFORMATION CONSENT\n\nI consent to the collection and use of my medical information for the following purposes:\n\nSAFETY PURPOSES:\n- Emergency medical treatment if needed\n- Assessment of fitness for participation\n- Communication with medical personnel\n- Safety planning for events\n\nINFORMATION COLLECTED:\n- Medical conditions and history\n- Allergies and medications\n- Emergency contact information\n- Medical certificates and clearances\n\nDATA SHARING:\nMedical information may be shared with:\n- Event medical staff\n- Emergency responders\n- Designated medical personnel\n- As required by law or safety regulations\n\nCONFIDENTIALITY:\nAll medical information will be treated as confidential and will only be used for the stated purposes. Access will be limited to authorized personnel only.\n\nBy signing this consent, I acknowledge that I have read and understood the above information and consent to the collection and use of my medical information as described.', '1.0');

-- Verify the updates
SELECT 'Students table updated successfully!' as status;
DESCRIBE students;
SELECT 'Consent forms table created!' as status;
DESCRIBE consent_forms;
SELECT 'Student consents table created!' as status;
DESCRIBE student_consents;
SELECT 'Student profiles table created!' as status;
DESCRIBE student_profiles;
