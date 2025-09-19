#!/usr/bin/env python3
"""
Complete test for student registration flow.
"""

import requests
import json
from datetime import date

def test_complete_registration():
    """Test complete student registration with all fields."""
    base_url = "http://localhost:8000"
    
    # Complete test data matching frontend form
    student_data = {
        "first_name": "John",
        "middle_name": "Michael",  # Optional field
        "last_name": "Doe",
        "gender": "male",
        "date_of_birth": "2000-01-15",
        "phone": "+1234567890",
        "email": "john.doe.complete@example.com",
        "institution_name": "Test University",
        "student_id": "STU001",
        "parent_guardian_name": "Jane Doe",
        "parent_phone": "+1234567891",
        "parent_email": "jane.doe@example.com",
        "emergency_contact_name": "Bob Smith",
        "emergency_contact_relation": "Uncle",
        "emergency_contact_phone": "+1234567892",
        "emergency_contact_email": "bob.smith@example.com",
        "medical_question_1": "No medical conditions",
        "medical_question_2": "No medications",
        "has_allergies": False,
        "allergies_details": None,
        "participation_type": "individual",
        "selected_sports": ["football", "basketball"],
        "student_id_image": None,
        "age_proof_image": None,
        "address": {
            "street": "123 Main St",
            "city": "Test City",
            "state": "Test State",
            "zip": "12345",
            "country": "Test Country"
        },
        "medical_info": {
            "blood_type": "O+",
            "emergency_contact": "Bob Smith"
        },
        "guardian": {
            "name": "Jane Doe",
            "relation": "Mother",
            "phone": "+1234567891"
        },
        "profile_picture": None,
        "password": "TestPassword123!"
    }
    
    print("🧪 Testing Complete Student Registration")
    print("=" * 60)
    print(f"Data: {json.dumps(student_data, indent=2, default=str)}")
    print()
    
    try:
        # Test student registration
        print("📤 Sending registration request...")
        response = requests.post(
            f"{base_url}/api/v1/students/register",
            json=student_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Student registration successful!")
            data = response.json()
            print(f"Student ID: {data.get('id')}")
            print(f"User ID: {data.get('user_id')}")
            print(f"Email: {data.get('email')}")
            print(f"Name: {data.get('first_name')} {data.get('middle_name')} {data.get('last_name')}")
            print(f"Institution: {data.get('institution_name')}")
            print(f"Selected Sports: {data.get('selected_sports')}")
            
            # Test retrieving the student
            student_id = data.get('id')
            if student_id:
                print(f"\n🔍 Testing student retrieval...")
                get_response = requests.get(f"{base_url}/api/v1/students/{student_id}")
                print(f"Get Status: {get_response.status_code}")
                if get_response.status_code == 200:
                    print("✅ Student data retrieved successfully!")
                    retrieved_data = get_response.json()
                    print(f"Retrieved Name: {retrieved_data.get('first_name')} {retrieved_data.get('middle_name')} {retrieved_data.get('last_name')}")
                    print(f"Retrieved Email: {retrieved_data.get('email')}")
                    print(f"Retrieved Institution: {retrieved_data.get('institution_name')}")
                else:
                    print(f"❌ Failed to retrieve student: {get_response.text}")
            
            return True
        else:
            print("❌ Student registration failed!")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure it's running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error testing student registration: {e}")
        return False

def test_registration_without_middle_name():
    """Test registration without middle name."""
    base_url = "http://localhost:8000"
    
    student_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "gender": "female",
        "date_of_birth": "2001-05-20",
        "phone": "+1234567893",
        "email": "jane.smith.no.middle@example.com",
        "institution_name": "Test College",
        "student_id": "STU002",
        "parent_guardian_name": "John Smith",
        "parent_phone": "+1234567894",
        "parent_email": "john.smith@example.com",
        "emergency_contact_name": "Alice Johnson",
        "emergency_contact_relation": "Aunt",
        "emergency_contact_phone": "+1234567895",
        "emergency_contact_email": "alice.johnson@example.com",
        "medical_question_1": "No medical conditions",
        "medical_question_2": "No medications",
        "has_allergies": True,
        "allergies_details": "Peanuts and shellfish",
        "participation_type": "team",
        "selected_sports": ["cricket", "tennis"],
        "password": "TestPassword456!"
    }
    
    print("\n🧪 Testing Registration Without Middle Name")
    print("=" * 60)
    
    try:
        response = requests.post(
            f"{base_url}/api/v1/students/register",
            json=student_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Registration without middle name successful!")
            data = response.json()
            print(f"Name: {data.get('first_name')} {data.get('middle_name')} {data.get('last_name')}")
            return True
        else:
            print("❌ Registration without middle name failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Complete Registration Tests")
    print("=" * 60)
    
    # Test 1: Complete registration
    success1 = test_complete_registration()
    
    # Test 2: Registration without middle name
    success2 = test_registration_without_middle_name()
    
    print("\n📊 Test Results Summary")
    print("=" * 60)
    print(f"Complete Registration: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"Registration without Middle Name: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1 and success2:
        print("\n🎉 All tests passed! Registration is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
