# Mara Sports Festival Database Schema

## Overview
This document describes the complete database schema for the Mara Sports Festival system. The database uses MySQL with three main user roles: **admin**, **institute**, and **student**.

## Database Configuration
- **Database**: MySQL 8.0+
- **Driver**: aiomysql (async)
- **Database Name**: `mara_sports_festival`
- **Host**: localhost
- **Port**: 3306

## Tables

### 1. users
**Purpose**: Core user authentication and authorization table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User email address |
| hashed_password | TEXT | NULL | Hashed password (NULL for OTP-only accounts) |
| role | ENUM | NOT NULL, DEFAULT 'student' | User role: admin, institute, student |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active status |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| last_login_at | DATETIME | NULL | Last login timestamp |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- INDEX (email)

### 2. institutions
**Purpose**: Educational institution profiles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique institution identifier |
| user_id | UUID | FOREIGN KEY, UNIQUE, NOT NULL | Reference to users.id |
| name | VARCHAR(255) | NOT NULL, INDEX | Institution name |
| email | VARCHAR(255) | NOT NULL, INDEX | Institution email |
| phone | VARCHAR(20) | NULL | Contact phone number |
| address | JSON | NULL | Address information (street, city, state, postal_code, country) |
| institution_type | VARCHAR(100) | NULL | Type of institution (school, college, university) |
| registration_number | VARCHAR(100) | NULL, INDEX | Official registration number |
| website | VARCHAR(500) | NULL | Institution website URL |
| description | TEXT | NULL | Institution description |
| verified | BOOLEAN | NOT NULL, DEFAULT false | Verification status |
| verification_date | VARCHAR(50) | NULL | Date of verification |
| verification_notes | TEXT | NULL | Verification notes |
| billing_info | JSON | NULL | Billing information (address, tax_id, payment_method) |
| contact_person_name | VARCHAR(255) | NULL | Primary contact person name |
| contact_person_phone | VARCHAR(20) | NULL | Contact person phone |
| contact_person_email | VARCHAR(255) | NULL | Contact person email |
| logo_url | VARCHAR(500) | NULL | Institution logo URL |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (user_id)
- INDEX (name)
- INDEX (email)
- INDEX (registration_number)

### 3. students
**Purpose**: Student profiles and information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique student identifier |
| user_id | UUID | FOREIGN KEY, UNIQUE, NOT NULL | Reference to users.id |
| first_name | VARCHAR(100) | NOT NULL | Student first name |
| middle_name | VARCHAR(100) | NULL | Student middle name |
| last_name | VARCHAR(100) | NOT NULL | Student last name |
| gender | VARCHAR(20) | NOT NULL | Student gender |
| date_of_birth | DATE | NOT NULL | Student date of birth |
| phone | VARCHAR(20) | NULL | Student phone number |
| address | JSON | NULL | Address information (street, city, state, postal_code, country) |
| medical_info | JSON | NULL | Medical information (conditions, allergies, medications, emergency_contact) |
| guardian | JSON | NULL | Guardian information (name, phone, relation) |
| institution_id | UUID | FOREIGN KEY, NULL | Reference to institutions.id |
| student_id | VARCHAR(50) | NULL, INDEX | Institution-specific student ID |
| profile_picture | VARCHAR(500) | NULL | Profile picture URL |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (user_id)
- INDEX (institution_id)
- INDEX (student_id)

### 4. sports
**Purpose**: Available sports and activities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique sport identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Sport name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly sport identifier |
| description | TEXT | NULL | Sport description |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (name)
- UNIQUE KEY (slug)

### 5. sport_categories
**Purpose**: Sport categories with age groups and fees

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique category identifier |
| sport_id | UUID | FOREIGN KEY, NOT NULL | Reference to sports.id |
| name | VARCHAR(100) | NOT NULL | Category name (e.g., "Under 18", "Senior") |
| age_from | INTEGER | NOT NULL | Minimum age for category |
| age_to | INTEGER | NOT NULL | Maximum age for category |
| gender_allowed | ENUM | NOT NULL | Allowed gender: male, female, mixed |
| fee | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Registration fee |
| max_participants | INTEGER | NULL | Maximum participants allowed |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (sport_id)

### 6. registrations
**Purpose**: Student sport registrations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique registration identifier |
| student_id | UUID | FOREIGN KEY, NOT NULL | Reference to students.id |
| sport_category_id | UUID | FOREIGN KEY, NOT NULL | Reference to sport_categories.id |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Registration status: pending, confirmed, rejected, cancelled |
| payment_id | UUID | FOREIGN KEY, NULL | Reference to payments.id |
| documents | JSON | NULL | Required documents (medical_certificate, consent_form, etc.) |
| notes | TEXT | NULL | Additional notes |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (student_id)
- INDEX (sport_category_id)
- INDEX (payment_id)

### 7. payments
**Purpose**: Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique payment identifier |
| registration_id | UUID | FOREIGN KEY, NOT NULL | Reference to registrations.id |
| institution_id | UUID | FOREIGN KEY, NOT NULL | Reference to institutions.id |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | Currency code |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Payment status: pending, completed, failed, refunded |
| provider | VARCHAR(50) | NOT NULL | Payment provider (razorpay, stripe, local) |
| provider_payload | JSON | NULL | Provider-specific data |
| transaction_id | VARCHAR(255) | NULL, INDEX | Provider transaction ID |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (registration_id)
- INDEX (institution_id)
- INDEX (transaction_id)

### 8. sponsorships
**Purpose**: Sponsorship information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique sponsorship identifier |
| institution_id | UUID | FOREIGN KEY, NOT NULL | Reference to institutions.id |
| sponsor_name | VARCHAR(255) | NOT NULL | Sponsor organization name |
| amount | DECIMAL(10,2) | NOT NULL | Sponsorship amount |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Sponsorship status: pending, approved, rejected |
| terms | JSON | NULL | Sponsorship terms and conditions |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (institution_id)

### 9. documents
**Purpose**: File uploads and documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique document identifier |
| owner_type | ENUM | NOT NULL | Owner type: student, institution |
| owner_id | UUID | NOT NULL | Reference to owner (student or institution) |
| filename | VARCHAR(255) | NOT NULL | Original filename |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type |
| size_bytes | BIGINT | NOT NULL | File size in bytes |
| storage_path | VARCHAR(500) | NOT NULL | Storage path/URL |
| uploaded_by | UUID | FOREIGN KEY, NOT NULL | Reference to users.id (uploader) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (owner_type, owner_id)
- INDEX (uploaded_by)

### 10. notifications
**Purpose**: System notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to users.id |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification content |
| data | JSON | NULL | Additional notification data |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Read status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (is_read)

### 11. otps
**Purpose**: OTP verification codes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique OTP identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to users.id |
| email_or_phone | VARCHAR(255) | NOT NULL | Email or phone number |
| code | VARCHAR(255) | NOT NULL | Hashed OTP code |
| purpose | ENUM | NOT NULL | OTP purpose: registration, login, password_reset |
| expires_at | DATETIME | NOT NULL | OTP expiration time |
| used | BOOLEAN | NOT NULL, DEFAULT false | Usage status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (email_or_phone)
- INDEX (expires_at)

### 12. audit_logs
**Purpose**: System audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique audit log identifier |
| actor_user_id | UUID | FOREIGN KEY, NULL | Reference to users.id (actor) |
| action | VARCHAR(100) | NOT NULL | Action performed |
| resource_type | VARCHAR(50) | NOT NULL | Resource type |
| resource_id | UUID | NOT NULL | Resource identifier |
| metadata | JSON | NULL | Additional action metadata |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (actor_user_id)
- INDEX (resource_type, resource_id)
- INDEX (created_at)

## Relationships

### Foreign Key Relationships
1. **institutions.user_id** → **users.id** (CASCADE DELETE)
2. **students.user_id** → **users.id** (CASCADE DELETE)
3. **students.institution_id** → **institutions.id** (SET NULL)
4. **sport_categories.sport_id** → **sports.id** (CASCADE DELETE)
5. **registrations.student_id** → **students.id** (CASCADE DELETE)
6. **registrations.sport_category_id** → **sport_categories.id** (CASCADE DELETE)
7. **registrations.payment_id** → **payments.id** (SET NULL)
8. **payments.registration_id** → **registrations.id** (CASCADE DELETE)
9. **payments.institution_id** → **institutions.id** (CASCADE DELETE)
10. **sponsorships.institution_id** → **institutions.id** (CASCADE DELETE)
11. **documents.uploaded_by** → **users.id** (CASCADE DELETE)
12. **notifications.user_id** → **users.id** (CASCADE DELETE)
13. **otps.user_id** → **users.id** (CASCADE DELETE)
14. **audit_logs.actor_user_id** → **users.id** (SET NULL)

## User Roles and Permissions

### Admin Role
- Full system access
- Manage all users, institutions, and students
- View all registrations and payments
- System configuration and monitoring
- Audit log access

### Institute Role
- Manage own institution profile
- View and manage students from their institution
- View registrations for their students
- Manage sponsorships
- Upload documents for students

### Student Role
- Manage own profile
- Register for sports
- View own registrations and payments
- Upload required documents
- View notifications

## Data Types

### JSON Fields
- **address**: `{"street": "string", "city": "string", "state": "string", "postal_code": "string", "country": "string"}`
- **medical_info**: `{"conditions": "string", "allergies": "string", "medications": "string", "emergency_contact": {"name": "string", "phone": "string", "relation": "string"}}`
- **guardian**: `{"name": "string", "phone": "string", "relation": "string"}`
- **billing_info**: `{"address": {...}, "tax_id": "string", "payment_method": "string"}`
- **documents**: `{"medical_certificate": "url", "consent_form": "url", "id_proof": "url"}`
- **provider_payload**: Provider-specific payment data
- **terms**: Sponsorship terms and conditions
- **data**: Additional notification data
- **metadata**: Audit log metadata

### ENUM Values
- **UserRole**: admin, institute, student
- **RegistrationStatus**: pending, confirmed, rejected, cancelled
- **PaymentStatus**: pending, completed, failed, refunded
- **SponsorshipStatus**: pending, approved, rejected
- **DocumentOwnerType**: student, institution
- **OTPPurpose**: registration, login, password_reset
- **GenderAllowed**: male, female, mixed

## Indexes and Performance

### Primary Indexes
- All tables have UUID primary keys
- Auto-incrementing integer IDs are not used

### Foreign Key Indexes
- All foreign key columns are indexed for join performance

### Unique Indexes
- Email addresses are unique across users
- Institution user_id is unique (one-to-one relationship)
- Student user_id is unique (one-to-one relationship)
- Sport names and slugs are unique

### Composite Indexes
- Document owner lookup: (owner_type, owner_id)
- Audit log queries: (resource_type, resource_id)

## Soft Delete Implementation
- All main entities use `is_active` boolean flag for soft deletes
- Soft deleted records are not physically removed
- Queries should filter by `is_active = true` for active records
- Audit logs are never soft deleted

## Migration Strategy
- Use Alembic for database migrations
- All schema changes are versioned
- Migrations are reversible
- Data migrations are handled separately from schema migrations

## Security Considerations
- All passwords are hashed using Argon2
- OTP codes are hashed before storage
- Sensitive data in JSON fields should be encrypted if required
- Audit logs provide complete action trail
- Soft deletes preserve data for compliance

## Backup and Recovery
- Regular automated backups of the database
- Point-in-time recovery capability
- Test restore procedures regularly
- Monitor backup integrity

## Monitoring and Maintenance
- Monitor table sizes and growth
- Regular index maintenance
- Query performance monitoring
- Deadlock detection and resolution
- Regular cleanup of expired OTPs and old audit logs
