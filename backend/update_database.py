#!/usr/bin/env python3
"""
Update database schema to match frontend requirements.
"""

import pymysql
from app.core.config import get_settings

def update_database():
    """Update database schema."""
    settings = get_settings()
    
    # Database connection
    connection = pymysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        charset='utf8mb4'
    )
    
    try:
        with connection.cursor() as cursor:
            print("🔄 Updating database schema...")
            
            # Update users table
            print("📝 Adding full_name to users table...")
            try:
                cursor.execute("ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) NULL AFTER `email`")
                print("✅ Added full_name column to users table")
            except pymysql.Error as e:
                if "Duplicate column name" in str(e):
                    print("ℹ️  full_name column already exists")
                else:
                    print(f"❌ Error adding full_name: {e}")
            
            # Update students table
            print("📝 Updating students table...")
            
            # Make middle_name optional
            try:
                cursor.execute("ALTER TABLE `students` MODIFY COLUMN `middle_name` VARCHAR(100) NULL")
                print("✅ Made middle_name optional")
            except pymysql.Error as e:
                print(f"ℹ️  middle_name update: {e}")
            
            # Add new columns
            new_columns = [
                ("email", "VARCHAR(255) NOT NULL AFTER `phone`"),
                ("institution_name", "VARCHAR(255) NULL AFTER `institution_id`"),
                ("parent_guardian_name", "VARCHAR(255) NULL AFTER `student_id`"),
                ("parent_phone", "VARCHAR(20) NULL AFTER `parent_guardian_name`"),
                ("parent_email", "VARCHAR(255) NULL AFTER `parent_phone`"),
                ("emergency_contact_name", "VARCHAR(255) NULL AFTER `parent_email`"),
                ("emergency_contact_relation", "VARCHAR(100) NULL AFTER `emergency_contact_name`"),
                ("emergency_contact_phone", "VARCHAR(20) NULL AFTER `emergency_contact_relation`"),
                ("emergency_contact_email", "VARCHAR(255) NULL AFTER `emergency_contact_phone`"),
                ("medical_question_1", "VARCHAR(500) NULL AFTER `emergency_contact_email`"),
                ("medical_question_2", "VARCHAR(500) NULL AFTER `medical_question_1`"),
                ("has_allergies", "TINYINT(1) NOT NULL DEFAULT 0 AFTER `medical_question_2`"),
                ("allergies_details", "VARCHAR(1000) NULL AFTER `has_allergies`"),
                ("participation_type", "VARCHAR(50) NULL AFTER `allergies_details`"),
                ("selected_sports", "JSON NULL AFTER `participation_type`"),
                ("student_id_image", "VARCHAR(500) NULL AFTER `selected_sports`"),
                ("age_proof_image", "VARCHAR(500) NULL AFTER `student_id_image`"),
                ("is_verified", "TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`")
            ]
            
            for column_name, column_def in new_columns:
                try:
                    cursor.execute(f"ALTER TABLE `students` ADD COLUMN `{column_name}` {column_def}")
                    print(f"✅ Added {column_name} column")
                except pymysql.Error as e:
                    if "Duplicate column name" in str(e):
                        print(f"ℹ️  {column_name} column already exists")
                    else:
                        print(f"❌ Error adding {column_name}: {e}")
            
            # Add indexes
            print("📝 Adding indexes...")
            indexes = [
                ("idx_students_email", "(`email`)"),
                ("idx_students_institution_name", "(`institution_name`)")
            ]
            
            for index_name, index_def in indexes:
                try:
                    cursor.execute(f"ALTER TABLE `students` ADD INDEX `{index_name}` {index_def}")
                    print(f"✅ Added {index_name} index")
                except pymysql.Error as e:
                    if "Duplicate key name" in str(e):
                        print(f"ℹ️  {index_name} index already exists")
                    else:
                        print(f"❌ Error adding {index_name}: {e}")
            
            connection.commit()
            print("🎉 Database schema updated successfully!")
            
    except Exception as e:
        print(f"❌ Error updating database: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    update_database()